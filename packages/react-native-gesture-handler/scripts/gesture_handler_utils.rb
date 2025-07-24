def try_to_parse_react_native_package_json(node_modules_dir)
    react_native_package_json_path = File.join(node_modules_dir, 'react-native/package.json')

    if !File.exist?(react_native_package_json_path)
        return nil
    end

    return JSON.parse(File.read(react_native_package_json_path))
end

def get_react_native_minor_version()
    react_native_node_modules_dir = File.join(File.dirname(`cd "#{Pod::Config.instance.installation_root.to_s}" && node --print "require.resolve('react-native/package.json')"`), '..')
    react_native_json = try_to_parse_react_native_package_json(react_native_node_modules_dir)

    if react_native_json == nil
        node_modules_dir = ENV["REACT_NATIVE_NODE_MODULES_DIR"]
        react_native_json = try_to_parse_react_native_package_json(node_modules_dir)
    end

    if react_native_json == nil
        raise '[react-native-gesture-handler] Unable to recognize your `react-native` version. Please set environmental variable with `react-native` location: `export REACT_NATIVE_NODE_MODULES_DIR="<path to react-native>" && pod install`.'
    end

    return react_native_json['version'].split('.')[1].to_i
end
