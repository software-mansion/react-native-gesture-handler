require "json"


is_gh_example_app = ENV["GH_EXAMPLE_APP_NAME"] != nil

compilation_metadata_dir = "CompilationDatabase"
compilation_metadata_generation_flag = is_gh_example_app ? '-gen-cdb-fragment-path ' + compilation_metadata_dir : ''

Pod::Spec.new do |s|
  # NPM package specification
  package = JSON.parse(File.read(File.join(File.dirname(__FILE__), "package.json")))

  s.name         = "RNGestureHandler"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/software-mansion/react-native-gesture-handler"
  s.license      = "MIT"
  s.author       = { package["author"]["name"] => package["author"]["email"] }
  s.source       = { :git => "https://github.com/software-mansion/react-native-gesture-handler", :tag => "#{s.version}" }
  s.source_files = "apple/**/*.{h,m,mm}", "shared/**/*.{h,cpp}"
  s.requires_arc = true
  s.platforms       = { ios: '11.0', tvos: '11.0', osx: '10.15', visionos: '1.0' }
  s.xcconfig = {
    "OTHER_CFLAGS" => "$(inherited) " + compilation_metadata_generation_flag
  }

  if defined?(install_modules_dependencies()) != nil
    install_modules_dependencies(s);
  else
    s.dependency "React-Core"
  end

  if ENV['USE_FRAMEWORKS'] != nil && ENV['RCT_NEW_ARCH_ENABLED'] == '1'
    add_dependency(s, "React-FabricComponents", :additional_framework_paths => [
      "react/renderer/textlayoutmanager/platform/ios",
      "react/renderer/components/textinput/platform/ios",
      "react/renderer/components/text/platform/cxx",
    ])
  end

end
