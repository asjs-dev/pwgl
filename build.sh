#!/bin/bash
echo "Build PWGL";
php ../asjs/builder/jsonBuilder.php builder_config/pwgl.build.config.json builder_config/webgl.variables.json
php ../asjs/builder/jsonBuilder.php builder_config/pwgl.extensions.build.config.json
