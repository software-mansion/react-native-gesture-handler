require 'rubygems'

module GestureHandlerUtils
    module_function

    MIN_REACT_NATIVE_WORKLETS_VERSION = Gem::Version.new('0.8.0')

    def try_to_parse_react_native_package_json(react_native_dir)
        react_native_package_json_path = File.join(react_native_dir, 'package.json')

        if !File.exist?(react_native_package_json_path)
            return nil
        end

        return JSON.parse(File.read(react_native_package_json_path))
    end

    def get_react_native_minor_version()
        react_native_dir = File.dirname(`cd "#{Pod::Config.instance.installation_root.to_s}" && node --print "require.resolve('react-native/package.json')"`)
        react_native_json = try_to_parse_react_native_package_json(react_native_dir)

        if react_native_json == nil
            node_modules_dir = ENV["REACT_NATIVE_NODE_MODULES_DIR"]
            if node_modules_dir != nil
                react_native_json = try_to_parse_react_native_package_json(File.join(node_modules_dir, 'react-native'))
            end
        end

        if react_native_json == nil
            raise '[react-native-gesture-handler] Unable to recognize your `react-native` version. Please set environmental variable with `react-native` location: `export REACT_NATIVE_NODE_MODULES_DIR="<path to react-native>" && pod install`.'
        end

        return react_native_json['version'].split('.')[1].to_i
    end

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
