require 'rubygems'

module GestureHandlerUtils
    module_function

    MIN_REACT_NATIVE_WORKLETS_VERSION = Gem::Version.new('0.8.0')

    def node_package_dir(package_name)
        package_json_path = `cd "#{Pod::Config.instance.installation_root.to_s}" && node --print "require.resolve('#{package_name}/package.json')" 2>/dev/null`.strip

        if !$?.success? || package_json_path.empty?
            return nil
        end

        return File.dirname(package_json_path)
    end

    def react_native_worklets_package_dir()
        return node_package_dir('react-native-worklets')
    end

    def react_native_worklets_supports_stable_api()
        package_dir = react_native_worklets_package_dir()

        if package_dir == nil || !File.exist?(File.join(package_dir, 'RNWorklets.podspec'))
            return false
        end

        package_json = JSON.parse(File.read(File.join(package_dir, 'package.json')))
        version_string = package_json['version']

        return false if version_string.include?('-')

        version = Gem::Version.new(version_string)

        return version >= MIN_REACT_NATIVE_WORKLETS_VERSION
    rescue JSON::ParserError, ArgumentError, TypeError, Errno::ENOENT
        return false
    end
end
