require "json"

fabric_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

isUserApp = File.exist?(File.join(__dir__, "..", "..", "node_modules", "react-native", "package.json"))
if isUserApp
  libInstances = %x[find ../../ -name "package.json" | grep "/react-native-gesture-handler/package.json" | grep -v "/.yarn/"]
  libInstancesArray = libInstances.split("\n")
  if libInstancesArray.length() > 1
    parsedLocation = ''
    for location in libInstancesArray
      location['../../'] = '- '
      location['/package.json'] = ''
      parsedLocation += location + "\n"
    end
    raise "[Gesture Handler] Multiple versions of Gesture Handler were detected. Only one instance of react-native-gesture-handler can be installed in a project. You need to resolve the conflict manually. Check out the documentation: https://docs.swmansion.com/react-native-gesture-handler/docs/troubleshooting#multiple-versions-of-reanimated-were-detected \n\nConflict between: \n" + parsedLocation
  end
end

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
  s.source_files = "ios/**/*.{h,m,mm}"
  s.requires_arc = true

  if fabric_enabled
    folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

    s.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/boost" "$(PODS_ROOT)/boost-for-react-native" "$(PODS_ROOT)/RCT-Folly"',
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    }
    s.platforms       = { ios: '11.0', tvos: '11.0' }
    s.compiler_flags  = folly_compiler_flags + ' -DRN_FABRIC_ENABLED'

    s.dependency "React"
    s.dependency "React-RCTFabric" # This is for fabric component
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  else
    s.platforms = { :ios => "9.0", :tvos => "9.0" }

    s.dependency "React-Core"
  end
end
