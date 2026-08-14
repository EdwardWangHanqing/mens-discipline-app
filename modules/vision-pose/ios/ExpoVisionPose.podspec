Pod::Spec.new do |s|
  s.name           = 'ExpoVisionPose'
  s.version        = '1.0.0'
  s.summary        = 'On-device Apple Vision pose adapter for the Mens Discipline app'
  s.description    = 'Application-local Expo module for deriving normalized body-pose observations from local images.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'ImageIO', 'Vision'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
