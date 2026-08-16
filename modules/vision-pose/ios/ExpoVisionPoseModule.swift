import ExpoModulesCore
import Foundation
import ImageIO
import Vision

public class ExpoVisionPoseModule: Module {
  private typealias JointDefinition = (
    name: String,
    visionName: VNHumanBodyPoseObservation.JointName
  )

  private static let supportedImageExtensions: Set<String> = [
    "heic", "heif", "jpeg", "jpg", "png", "tif", "tiff"
  ]

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

  public func definition() -> ModuleDefinition {
    Name("ExpoVisionPose")

    AsyncFunction("detectPoseFromImageFile") {
      (imageUri: String, orientation: String, isMirrored: Bool) -> [String: Any] in
      guard let imageUrl = self.localImageUrl(from: imageUri) else {
        return self.failureResult(
          status: "invalidInput",
          errorCode: self.isNonLocalUri(imageUri) ? "nonLocalUri" : "invalidUri",
          message: "Provide a local file URI or absolute local file path."
        )
      }

      guard let imageOrientation = self.imageOrientation(
        from: orientation,
        isMirrored: isMirrored
      ) else {
        return self.failureResult(
          status: "invalidInput",
          errorCode: "unsupportedOrientation",
          message: "The image orientation is not supported."
        )
      }

      var isDirectory: ObjCBool = false
      guard FileManager.default.fileExists(
        atPath: imageUrl.path,
        isDirectory: &isDirectory
      ), !isDirectory.boolValue else {
        return self.failureResult(
          status: "invalidInput",
          errorCode: "fileNotFound",
          message: "The local image file does not exist."
        )
      }

      guard FileManager.default.isReadableFile(atPath: imageUrl.path) else {
        return self.failureResult(
          status: "invalidInput",
          errorCode: "unreadableFile",
          message: "The local image file is not readable."
        )
      }

      guard Self.supportedImageExtensions.contains(
        imageUrl.pathExtension.lowercased()
      ) else {
        return self.failureResult(
          status: "invalidInput",
          errorCode: "unsupportedFormat",
          message: "The local file is not a supported diagnostic image format."
        )
      }

      do {
        let request = VNDetectHumanBodyPoseRequest()
        let requestHandler = VNImageRequestHandler(
          url: imageUrl,
          orientation: imageOrientation,
          options: [:]
        )
        try requestHandler.perform([request])

        guard let observation = request.results?.max(
          by: { $0.confidence < $1.confidence }
        ) else {
          return self.emptyResult(status: "noPose")
        }

        let recognizedPoints = try observation.recognizedPoints(.all)
        let joints = Self.jointDefinitions.map { definition in
          self.jointResult(
            definition: definition,
            recognizedPoints: recognizedPoints
          )
        }
        let availableJointCount = joints.reduce(into: 0) { count, joint in
          if joint["available"] as? Bool == true {
            count += 1
          }
        }

        guard availableJointCount > 0 else {
          return self.emptyResult(status: "noPose")
        }

        let status = availableJointCount == Self.jointDefinitions.count
          ? "poseAvailable"
          : "partialPoseAvailable"

        return [
          "status": status,
          "frame": [
            "source": "localImage",
            "timestampMs": Date().timeIntervalSince1970 * 1_000,
            "orientation": orientation,
            "isMirrored": isMirrored,
            "coordinateOrigin": "bottomLeft",
            "overallConfidence": Double(observation.confidence),
            "availableJointCount": availableJointCount,
            "joints": joints,
          ],
          "errorCode": NSNull(),
          "message": NSNull(),
        ]
      } catch {
        return self.failureResult(
          status: "processingFailed",
          errorCode: "visionError",
          message: "Apple Vision could not process the local image."
        )
      }
    }
  }

  private func localImageUrl(from imageUri: String) -> URL? {
    let trimmedUri = imageUri.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedUri.isEmpty else {
      return nil
    }

    if trimmedUri.hasPrefix("/") {
      return URL(fileURLWithPath: trimmedUri).standardizedFileURL
    }

    guard let url = URL(string: trimmedUri), url.isFileURL else {
      return nil
    }

    return url.standardizedFileURL
  }

  private func isNonLocalUri(_ imageUri: String) -> Bool {
    guard let scheme = URLComponents(string: imageUri)?.scheme else {
      return false
    }

    return scheme.lowercased() != "file"
  }

  private func imageOrientation(
    from orientation: String,
    isMirrored: Bool
  ) -> CGImagePropertyOrientation? {
    switch (orientation, isMirrored) {
    case ("up", false):
      return .up
    case ("up", true):
      return .upMirrored
    case ("down", false):
      return .down
    case ("down", true):
      return .downMirrored
    case ("left", false):
      return .left
    case ("left", true):
      return .leftMirrored
    case ("right", false):
      return .right
    case ("right", true):
      return .rightMirrored
    default:
      return nil
    }
  }

  private func jointResult(
    definition: JointDefinition,
    recognizedPoints: [VNHumanBodyPoseObservation.JointName: VNRecognizedPoint]
  ) -> [String: Any] {
    guard let point = recognizedPoints[definition.visionName], point.confidence > 0 else {
      return [
        "name": definition.name,
        "x": NSNull(),
        "y": NSNull(),
        "confidence": 0.0,
        "available": false,
      ]
    }

    return [
      "name": definition.name,
      "x": normalized(Double(point.location.x)),
      "y": normalized(Double(point.location.y)),
      "confidence": Double(point.confidence),
      "available": true,
    ]
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
