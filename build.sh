#!/bin/bash
echo "Build PWGL";

if [ -e ../asjs/builder/jsonBuilder.php ]
then
  php ../asjs/builder/jsonBuilder.php builder_config/pwgl.build.config.json builder_config/webgl.variables.json
  php ../asjs/builder/jsonBuilder.php builder_config/pwgl.extensions.build.config.json
else
  echo "ASJS Builder not found! Use Vite build only.";
fi