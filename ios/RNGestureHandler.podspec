
Pod::Spec.new do |s|
  s.name         = "RNGestureHandler"
  s.version      = "1.0.0"
  s.summary      = "RNGestureHandler"
  s.description  = <<-DESC
                  RNGestureHandler
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/RNGestureHandler.git", :tag => "master" }
  s.source_files  = "RNGestureHandler/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

  