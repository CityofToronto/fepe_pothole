const gulp = require('gulp');
const core = require('./node_modules/core/gulp_helper');
const pkg = require('./package.json');

core.embeddedApp.createTasks(gulp, {
  pkg,
  embedArea: 'full',
  environmentOverride: null,
  deploymentPath: '',
  preprocessorContext: {
    local: {
      DATA: `https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/pothole_data/pothole_dev`
    },
    dev: {
      DATA: `https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/pothole_data/pothole_dev`
    },
    qa: {
      DATA: `https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/pothole_data/pothole_qa`
    },
    prod: {}
  }
});


gulp.task('_data', () => {
  let myDataPath = '/resources/cdn/cotui/cotui';
  gulp.src(['node_modules/cotui/dist/cotui/**/*']).pipe(gulp.dest('dist' + myDataPath));
})