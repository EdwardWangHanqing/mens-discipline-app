import AVFoundation
import ExpoModulesCore
import ImageIO
import Vision

final class ExpoVisionPoseCameraView: ExpoView, AVCaptureVideoDataOutputSampleBufferDelegate {
  private typealias JointDefinition = (
    name: String,
    vision2DName: VNHumanBodyPoseObservation.JointName
  )

  let onCameraState = EventDispatcher()
  let onPoseFrame = EventDispatcher()

  private static let jointDefinitions: [JointDefinition] = [
    ("nose", .nose),
    ("leftEye", .leftEye),
    ("rightEye", .rightEye),
    ("leftEar", .leftEar),
    ("rightEar", .rightEar),
    ("neck", .neck),
    ("leftShoulder", .leftShoulder),
    ("rightShoulder", .rightShoulder),
    ("leftElbow", .leftElbow),
    ("rightElbow", .rightElbow),
    ("leftWrist", .leftWrist),
    ("rightWrist", .rightWrist),
    ("root", .root),
    ("leftHip", .leftHip),
    ("rightHip", .rightHip),
    ("leftKnee", .leftKnee),
    ("rightKnee", .rightKnee),
    ("leftAnkle", .leftAnkle),
    ("rightAnkle", .rightAnkle),
  ]

  private let captureSession = AVCaptureSession()
  private let previewLayer: AVCaptureVideoPreviewLayer
  private let sessionQueue = DispatchQueue(
    label: "com.temperline.mensdiscipline.vision-pose.camera-session"
  )
  private let visionQueue = DispatchQueue(
    label: "com.temperline.mensdiscipline.vision-pose.processing",
    qos: .userInitiated
  )

  private var requestedActive = false
  private var configuredPosition: AVCaptureDevice.Position?
  private var requestedPosition: AVCaptureDevice.Position = .front
  private var lastProcessedTimestamp = CMTime.invalid
  private var sequenceNumber = 0
  private var isProcessingFrame = false

  required init(appContext: AppContext? = nil) {
    previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
    super.init(appContext: appContext)
    backgroundColor = .black
    clipsToBounds = true
    previewLayer.videoGravity = .resizeAspectFill
    layer.addSublayer(previewLayer)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    previewLayer.frame = bounds
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    updateCaptureState()
  }

  deinit {
    captureSession.stopRunning()
  }

  func setActive(_ active: Bool) {
    guard requestedActive != active else {
      return
    }
    requestedActive = active
    updateCaptureState()
  }

  func setCameraPosition(_ cameraPosition: String) {
    let nextPosition: AVCaptureDevice.Position = cameraPosition == "back" ? .back : .front
    guard requestedPosition != nextPosition else {
      return
    }
    requestedPosition = nextPosition
    updateCaptureState(forceReconfigure: true)
  }

  private func updateCaptureState(forceReconfigure: Bool = false) {
    let shouldRun = requestedActive && window != nil
    let position = requestedPosition
    sessionQueue.async { [weak self] in
      guard let self else {
        return
      }

      if !shouldRun {
        if self.captureSession.isRunning {
          self.captureSession.stopRunning()
        }
        self.emitCameraState(status: "stopped")
        return
      }

      guard AVCaptureDevice.authorizationStatus(for: .video) == .authorized else {
        self.emitCameraState(
          status: "permissionRequired",
          message: "Camera permission is required before live pose tracking can start."
        )
        return
      }

      if forceReconfigure || self.configuredPosition != position {
        if self.captureSession.isRunning {
          self.captureSession.stopRunning()
        }
        self.removeCaptureInputsAndOutputs()
        self.configuredPosition = nil
      }

      if self.configuredPosition == nil {
        do {
          try self.configureCaptureSession(position: position)
        } catch {
          self.emitCameraState(
            status: "failed",
            message: "The selected camera could not be configured."
          )
          return
        }
      }

      if !self.captureSession.isRunning {
        self.emitCameraState(status: "starting")
        self.captureSession.startRunning()
      }
      self.emitCameraState(status: "running")
    }
  }

  private func configureCaptureSession(position: AVCaptureDevice.Position) throws {
    guard
      let camera = AVCaptureDevice.default(
        .builtInWideAngleCamera,
        for: .video,
        position: position
      )
    else {
      throw CameraSetupError.cameraUnavailable
    }

    let input = try AVCaptureDeviceInput(device: camera)
    let output = AVCaptureVideoDataOutput()
    output.alwaysDiscardsLateVideoFrames = true
    output.videoSettings = [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
    ]
    output.setSampleBufferDelegate(self, queue: visionQueue)

    captureSession.beginConfiguration()
    defer { captureSession.commitConfiguration() }
    captureSession.sessionPreset = .vga640x480

    guard captureSession.canAddInput(input), captureSession.canAddOutput(output) else {
      throw CameraSetupError.unsupportedConfiguration
    }
    captureSession.addInput(input)
    captureSession.addOutput(output)

    DispatchQueue.main.async { [weak self] in
      guard let previewConnection = self?.previewLayer.connection else {
        return
      }
      if #available(iOS 17.0, *) {
        if previewConnection.isVideoRotationAngleSupported(90) {
          previewConnection.videoRotationAngle = 90
        }
      } else {
        previewConnection.videoOrientation = .portrait
      }
      previewConnection.automaticallyAdjustsVideoMirroring = false
      previewConnection.isVideoMirrored = position == .front
    }
    configuredPosition = position
    lastProcessedTimestamp = .invalid
    sequenceNumber = 0
  }

  private func removeCaptureInputsAndOutputs() {
    captureSession.beginConfiguration()
    captureSession.inputs.forEach(captureSession.removeInput)
    captureSession.outputs.forEach(captureSession.removeOutput)
    captureSession.commitConfiguration()
  }

  func captureOutput(
    _ output: AVCaptureOutput,
    didOutput sampleBuffer: CMSampleBuffer,
    from connection: AVCaptureConnection
  ) {
    guard requestedActive, !isProcessingFrame,
      let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer)
    else {
      return
    }

    let presentationTimestamp = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
    if lastProcessedTimestamp.isValid {
      let elapsed = CMTimeGetSeconds(presentationTimestamp - lastProcessedTimestamp)
      guard elapsed >= 0.1 else {
        return
      }
    }
    lastProcessedTimestamp = presentationTimestamp
    isProcessingFrame = true
    defer { isProcessingFrame = false }

    let processingStartedAt = CACurrentMediaTime()
    sequenceNumber += 1
    let currentSequenceNumber = sequenceNumber
    let position = configuredPosition ?? requestedPosition
    let isMirrored = position == .front
    let imageOrientation: CGImagePropertyOrientation = isMirrored ? .leftMirrored : .right
    let orientationName = isMirrored ? "left" : "right"

    do {
      let request = VNDetectHumanBodyPoseRequest()
      let requestHandler = VNImageRequestHandler(
        cvPixelBuffer: pixelBuffer,
        orientation: imageOrientation,
        options: [:]
      )
      try requestHandler.perform([request])

      guard
        let observation = request.results?.max(
          by: { $0.confidence < $1.confidence }
        )
      else {
        emitPoseResult(
          result: emptyResult(status: "noPose"),
          sequenceNumber: currentSequenceNumber,
          processingStartedAt: processingStartedAt
        )
        return
      }

      let recognizedPoints = try observation.recognizedPoints(.all)
      let threeDimensionalResult = detectThreeDimensionalPose(
        pixelBuffer: pixelBuffer,
        orientation: imageOrientation
      )
      let joints = Self.jointDefinitions.map { definition in
        jointResult(
          definition: definition,
          recognizedPoints: recognizedPoints,
          threeDimensionalPositions: threeDimensionalResult.positions
        )
      }
      let availableJointCount = joints.reduce(into: 0) { count, joint in
        if joint["available"] as? Bool == true {
          count += 1
        }
      }

      guard availableJointCount > 0 else {
        emitPoseResult(
          result: emptyResult(status: "noPose"),
          sequenceNumber: currentSequenceNumber,
          processingStartedAt: processingStartedAt
        )
        return
      }

      let status =
        availableJointCount == Self.jointDefinitions.count
        ? "poseAvailable"
        : "partialPoseAvailable"
      let result: [String: Any] = [
        "status": status,
        "frame": [
          "source": "liveCamera",
          "timestampMs": Date().timeIntervalSince1970 * 1_000,
          "orientation": orientationName,
          "isMirrored": isMirrored,
          "coordinateOrigin": "bottomLeft",
          "overallConfidence": Double(observation.confidence),
          "availableJointCount": availableJointCount,
          "hasThreeDimensionalPose": !threeDimensionalResult.positions.isEmpty,
          "threeDimensionalHeightEstimation": threeDimensionalResult.heightEstimation,
          "joints": joints,
        ],
        "errorCode": NSNull(),
        "message": NSNull(),
      ]
      emitPoseResult(
        result: result,
        sequenceNumber: currentSequenceNumber,
        processingStartedAt: processingStartedAt
      )
    } catch {
      emitPoseResult(
        result: failureResult(
          status: "processingFailed",
          errorCode: "visionError",
          message: "Apple Vision could not process the live camera frame."
        ),
        sequenceNumber: currentSequenceNumber,
        processingStartedAt: processingStartedAt
      )
    }
  }

  private func detectThreeDimensionalPose(
    pixelBuffer: CVPixelBuffer,
    orientation: CGImagePropertyOrientation
  ) -> (positions: [String: [String: Any]], heightEstimation: Any) {
    guard #available(iOS 17.0, *) else {
      return ([:], NSNull())
    }

    do {
      let request = VNDetectHumanBodyPose3DRequest()
      let handler = VNImageRequestHandler(
        cvPixelBuffer: pixelBuffer,
        orientation: orientation,
        options: [:]
      )
      try handler.perform([request])
      guard let observation = request.results?.first else {
        return ([:], NSNull())
      }

      let definitions: [(String, VNHumanBodyPose3DObservation.JointName)] = [
        ("root", .root),
        ("leftShoulder", .leftShoulder),
        ("rightShoulder", .rightShoulder),
        ("leftElbow", .leftElbow),
        ("rightElbow", .rightElbow),
        ("leftWrist", .leftWrist),
        ("rightWrist", .rightWrist),
        ("leftHip", .leftHip),
        ("rightHip", .rightHip),
        ("leftKnee", .leftKnee),
        ("rightKnee", .rightKnee),
        ("leftAnkle", .leftAnkle),
        ("rightAnkle", .rightAnkle),
      ]
      var positions: [String: [String: Any]] = [:]
      for definition in definitions {
        guard let point = try? observation.recognizedPoint(definition.1) else {
          continue
        }
        let translation = point.position.columns.3
        guard translation.x.isFinite, translation.y.isFinite, translation.z.isFinite else {
          continue
        }
        positions[definition.0] = [
          "x": Double(translation.x),
          "y": Double(translation.y),
          "z": Double(translation.z),
          "coordinateSpace": "modelRelativeToRoot",
        ]
      }
      let heightEstimation =
        observation.heightEstimation == .measured
        ? "measured"
        : "reference"
      return (positions, heightEstimation)
    } catch {
      return ([:], NSNull())
    }
  }

  private func jointResult(
    definition: JointDefinition,
    recognizedPoints: [VNHumanBodyPoseObservation.JointName: VNRecognizedPoint],
    threeDimensionalPositions: [String: [String: Any]]
  ) -> [String: Any] {
    let position3D: Any = threeDimensionalPositions[definition.name] ?? NSNull()
    guard let point = recognizedPoints[definition.vision2DName], point.confidence > 0 else {
      return [
        "name": definition.name,
        "x": NSNull(),
        "y": NSNull(),
        "confidence": 0.0,
        "available": false,
        "position3D": position3D,
      ]
    }

    return [
      "name": definition.name,
      "x": normalized(Double(point.location.x)),
      "y": normalized(Double(point.location.y)),
      "confidence": Double(point.confidence),
      "available": true,
      "position3D": position3D,
    ]
  }

  private func emitCameraState(status: String, message: String? = nil) {
    let permissionStatus: String
    switch AVCaptureDevice.authorizationStatus(for: .video) {
    case .authorized:
      permissionStatus = "authorized"
    case .denied:
      permissionStatus = "denied"
    case .restricted:
      permissionStatus = "restricted"
    case .notDetermined:
      permissionStatus = "notDetermined"
    @unknown default:
      permissionStatus = "unknown"
    }

    DispatchQueue.main.async { [weak self] in
      self?.onCameraState([
        "status": status,
        "permissionStatus": permissionStatus,
        "cameraPosition": self?.requestedPosition == .back ? "back" : "front",
        "message": message ?? NSNull(),
      ])
    }
  }

  private func emitPoseResult(
    result: [String: Any],
    sequenceNumber: Int,
    processingStartedAt: CFTimeInterval
  ) {
    let processingDurationMs = (CACurrentMediaTime() - processingStartedAt) * 1_000
    DispatchQueue.main.async { [weak self] in
      self?.onPoseFrame([
        "result": result,
        "sequenceNumber": sequenceNumber,
        "processingDurationMs": processingDurationMs,
      ])
    }
  }

  private func normalized(_ value: Double) -> Double {
    min(max(value, 0), 1)
  }

  private func emptyResult(status: String) -> [String: Any] {
    [
      "status": status,
      "frame": NSNull(),
      "errorCode": NSNull(),
      "message": NSNull(),
    ]
  }

  private func failureResult(
    status: String,
    errorCode: String,
    message: String
  ) -> [String: Any] {
    [
      "status": status,
      "frame": NSNull(),
      "errorCode": errorCode,
      "message": message,
    ]
  }
}

private enum CameraSetupError: Error {
  case cameraUnavailable
  case unsupportedConfiguration
}
