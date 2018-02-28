
Pod::Spec.new do |s|
  s.name         = "RNGestureHandler"
  s.version      = "1.0.0"
  s.summary      = "RNGestureHandler"
  s.description  = <<-DESC
                  RNGestureHandler
                   DESC
  s.homepage     = "https://github.com/kmagiera/react-native-gesture-handler"
  s.license      = "MIT"
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/RNGestureHandler.git", :tag => "master" }
  s.source_files  = "RNGestureHandler/**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React"

end

  
