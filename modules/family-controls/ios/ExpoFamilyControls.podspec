Pod::Spec.new do |s|
  s.name           = 'ExpoFamilyControls'
  s.version        = '1.0.0'
  s.summary        = 'Family Controls authorization bridge for the Mens Discipline app'
  s.description    = 'Application-local Expo module for querying and requesting Family Controls authorization.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'FamilyControls', 'ManagedSettings', 'SwiftUI'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
