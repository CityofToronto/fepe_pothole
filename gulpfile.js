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
      DATA_ANNUAL: `https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/pothole_data/pothole_dev_annual`,
      DATA_YTD: `https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/pothole_data/pothole_dev_ytd`
    },
    dev: {
      DATA_ANNUAL: `https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/pothole_data/pothole_dev_annual`,
      DATA_YTD: `https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/pothole_data/pothole_dev_ytd`
    },
    qa: {
      DATA_ANNUAL: `https://secure.toronto.ca/c3api_data/v2/DataAccess.svc/pothole_data/pothole_annual`||`https://was-inter-qa.toronto.ca/c3api_data/v2/DataAccess.svc/pothole_data/pothole_qa_annual`,
      DATA_YTD: `https://secure.toronto.ca/c3api_data/v2/DataAccess.svc/pothole_data/pothole_ytd`||`https://was-inter-qa.toronto.ca/c3api_data/v2/DataAccess.svc/pothole_data/pothole_qa_ytd`
    },
    prod: {
      DATA_ANNUAL: `https://secure.toronto.ca/c3api_data/v2/DataAccess.svc/pothole_data/pothole_annual`,
      DATA_YTD: `https://secure.toronto.ca/c3api_data/v2/DataAccess.svc/pothole_data/pothole_ytd`
    }
  }
});


gulp.task('_data', () => {
  let myDataPath = '/resources/cdn/cotui/cotui';
  gulp.src(['/usr/local/node_apps/toronto_ca/cot-apps/COT_UI/dist/cotui/**/*']).pipe(gulp.dest('dist' + myDataPath));
  //gulp.src(['node_modules/cotui/dist/cotui/**/*']).pipe(gulp.dest('dist' + myDataPath));
})