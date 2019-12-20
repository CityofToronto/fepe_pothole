// The main javascript file for fepe_pothole.
// IMPORTANT:
// Any resources from this project should be referenced using SRC_PATH preprocessor var
// Ex: let myImage = '/*@echo SRC_PATH*//img/sample.jpg';

var PHDATA;
var updateCards = function(res,id,showYTD){
  console.debug('updateCards', res, res.chartData.labels);
  //let showYTD = document.getElementById("ytd_toggle").checked;
  var $potholeFilled = document.getElementById(id);
      $potholeFilled.innerHTML = '';
      $potholeFilled.style.fontSize = '0.865em';
        
      
    res.chartData.datasets.forEach((dataset,ndx)=>{
      const $card = document.createElement('cotui-chart');
      const chartColour = dataset.backgroundColor;

      const value = dataset.data.reduce((p,c)=>{ return c+=p})
      $card.id = `filled-counts-${dataset.label}`;
      $card.setAttribute('chart-type','card');
      $card.setAttribute('chart-title',dataset.label);
      $card.setAttribute('chart-value', value.toString().formatNumber());
      $card.setAttribute('chart-colour', chartColour );
      $card.setAttribute('card-style', "" );
      $card.setAttribute('style',`margin: 0.2rem;`);
      $card.setAttribute('caption',`${showYTD?`Year-to-Date`:`Year-End`}`); 
      
      $potholeFilled.appendChild($card);        
    })
};

var $widgetMonth = document.getElementById('pothole-bar-month');
var $widgetYear = document.getElementById('pothole-bar-year');


$(function () {
  if (window['CotApp']) { //the code in this 'if' block should be deleted for embedded apps
    const app = new CotApp("fepe_pothole",{
      hasContentTop: false,
      hasContentBottom: false,
      hasContentRight: false,
      hasContentLeft: false,
      searchcontext: 'INTER'
    });
  }
})



$(document).ready(function(){
  let $container = $('#fepe_pothole_container');

  PHDATA = new PotholeData();
  PHDATA.colours = ['#1170aa','#fc7d0b','#a16bb1','#57606c','#5fa2ce'];
  PHDATA.maxYears = 5;
  
  document.getElementById('month').setAttribute('data-label','Year-to-Date Pothole Repairs');




  PHDATA.getData('MONTH,YEAR',true).then(res=>{
    /* Update the Year-to-Date View*/
    document.getElementById('js-chart-title-month').innerHTML = `Potholes filled for the period of January &mdash; ${moment().format('MMMM D')}`
    updateCards(res,'filled-counts-month',true);

    return res;
  })

  PHDATA.getData('MONTH,YEAR').then(res=>{ 
    /* Update the Year-to-Date View */
    $widgetMonth.data=res;

    /* Update Annual View */
    document.getElementById('js-chart-title-year').innerHTML = `Potholes filled for the period of January 1 &mdash; December 31`
    let filteredDataset = res.chartData.datasets.filter(dataset=>{
      return parseInt(dataset.label) < moment().format('YYYY')
    })

    let updatedResults = JSON.parse(JSON.stringify(res))
    updatedResults.chartData.datasets = filteredDataset;
    updateCards(updatedResults,'filled-counts-year');
    $widgetYear.data=updatedResults 

    // document.getElementById('js-chart-title-year').innerHTML = `Potholes filled for the period of January 1 &mdash; December 31`
    // document.querySelectorAll('.reset-view__button').forEach($btn=>{
    //   $btn.addEventListener('click',evt=>{
    //     evt.target.parentElement.hidden = true;
    //     $widgetYear.data = res;
    //     })
    //   })
    // })

    return res;
  })

  /*

  Promise.all([
    PHDATA.getData('MONTH,YEAR',true).then(res=>{
      // Update the Year-to-Date View
      document.getElementById('js-chart-title-month').innerHTML = `Potholes filled for the period of January &mdash; ${moment().format('MMMM D')}`
      updateCards(res,'filled-counts-month',true);

      return res;
    }),
    PHDATA.getData('MONTH,YEAR').then(res=>{ 
      // Update the Year-to-Date View
      $widgetMonth.data=res;

      // Update Annual View
      document.getElementById('js-chart-title-year').innerHTML = `Potholes filled for the period of January 1 &mdash; December 31`
      let filteredDataset = res.chartData.datasets.filter(dataset=>{
        return parseInt(dataset.label) < moment().format('YYYY')
      })

      let updatedResults = JSON.parse(JSON.stringify(res))
      updatedResults.chartData.datasets = filteredDataset;
      updateCards(updatedResults,'filled-counts-year');
      $widgetYear.data=updatedResults 

      // document.getElementById('js-chart-title-year').innerHTML = `Potholes filled for the period of January 1 &mdash; December 31`
      // document.querySelectorAll('.reset-view__button').forEach($btn=>{
      //   $btn.addEventListener('click',evt=>{
      //     evt.target.parentElement.hidden = true;
      //     $widgetYear.data = res;
      //     })
      //   })
      // })

      return res;
    })
   
  ]).then(function(arrayOfValuesOrErrors) {
    console.log('All Data Loaded');
  }).catch(err=>{
    $container.innerHTML = '<div class="well">Error loading data</div>'
  })    
  */
})