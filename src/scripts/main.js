// The main javascript file for fepe_pothole.
// IMPORTANT:
// Any resources from this project should be referenced using SRC_PATH preprocessor var
// Ex: let myImage = '/*@echo SRC_PATH*//img/sample.jpg';

String.prototype.formatNumber = function(places=0) {  
  var n = this;
  var regex = /\d{1,3}(?=(\d{3})+(?!\d))/g;
  var intNum = typeof n != 'number' ? parseFloat(n.replace(/\,/g, '')) : n;

  if(places < 0){
    return intNum.toString().replace(regex, '$&,');
  } else {
    return intNum.toFixed(places).toString().replace(regex, '$&,');
  }
}


const getJSON = (url)=>{

  return new Promise(function(resolve,reject){
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      if(request){
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const data = JSON.parse(request.responseText);
                resolve(data);
            } else {
                reject(new Error(`Error: ${JSON.parse(request.response)}`) )
                // We reached our target server, but it returned an error
            }
        };
        request.onerror = function() {
          // There was a connection error of some sort
          };
          request.send();
      }
     
  })
}


class Dashboard{
  constructor(){}

  Model(){
      return{
        meta:{
          title:'',
          enableSearch: true,
          cssGrid:{
            master:{
              'grid-template-columns': '40px 50px auto 50px 40px',
              'grid-template-rows': '25% 100px auto'
            },
            detail:{
              'grid-template-columns': '40px 50px auto 50px 40px',
              'grid-template-rows': '25% 100px auto'
            }
          },
          layout:[{
            panelID: 'panel--0000',
            class:'',
            icon:'png|gif|svg',
            widget:'card',
            widgetLink: 'master-detail', // http(s?)://
            cssGrid:{
              'grid-column-start': '2',
              'grid-column-end': 'five',
              'grid-row-start': 'row1-start',
              'grid-row-end': '3'
            }
          }]
        },
        panels:[{
          id:'panel-0000',
          label: 'Number of Personal Bankruptcies\n(Ontario)',
          caption: '',
          description:'',
          body:'',

          category:['Community Vulnerability'],
          keywords:[''],
          data:{
            calculatedValue: null,
            labels:[],
            datasets:{ label:'', data:[] }
          }
        }]
      }
  }
}



class PotholeData{
  constructor(){
    _self = this;
    this.today = new Date();
    this.dimension = null;
    this.filter = null;
    this.showYTD = false;

    this.url = '/*@echo DATA_YTD*/?$format=json&unwrap=true';
    this.months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    this.colours = null;//['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'];
    this.maxYears = 4;
  }
  

  calculateCumulativeData(_dataset,id){
    var b = [null];
    var sum = 0;
    _dataset.data.reduce((prev,curr,ndx,arr)=>{
      sum += arr[ndx-1];
      b.push(sum);
    });

    return [{
      stack:`ytd-${_dataset.label}`,
      label:`Previous Total (${_dataset.label})`,
      backgroundColor:'#ddd' ,
      data:b,
    },{
      stack:`ytd-${_dataset.label}`,
      label:`Added (${_dataset.label})`,
      backgroundColor: _dataset.backgroundColor,
      data:_dataset.data
    }];
  }

  getData(dimension = this.dimension,showYTD=false, filter=this.filter){
    console.debug('getData',dimension,filter, document.getElementById("ytd_toggle").checked);
    
    //const showYTD = document.getElementById("ytd_toggle").checked;
    const url = showYTD?'/*@echo DATA_YTD*/?$format=json&unwrap=true':'/*@echo DATA_ANNUAL*/?$format=json&unwrap=true';
    //const url = '/*@echo DATA_ANNUAL*/?$format=json&unwrap=true';
    const onClick = function(dimension,e,d,t){
       
      /*
      if(d.length > 0){
        //document.getElementById('filter-button').style.display = null;
        let $potholeBar = document.getElementById('pothole-bar');
        
        d.forEach(dta=>{
          //dta._chart.chart.options = p.getData(dimension).chartOptions;         
          dta._chart.chart.data = p.getData(dimension,dta._model.label).chartData;        
          dta._chart.chart.update({
            duration: 800,
            easing: 'easeOutBounce'
          });
        })
        
      }
      */
      //$potholeBar.updateComponent();
    }
    
    var orderby = (function(){
      return dimension.split(',').map(d=>{
        return `${d} asc`
      }).join(',');
    })();

    
    return getJSON(`${url}&$apply=${filter?`filter(YEAR eq '${filter}')/`:``}groupby((${dimension}))/aggregate(POTHOLESFILLED with sum as total)&$orderby=${orderby}`).then(res=>{
      console.debug('getJSON',filter, res)
      var datasets = [];
      var labels = []; 
      var data =[];
      var backgroundColor = this.colours;

      if(dimension != 'YEAR'){
        var datasetTemp = [];
        labels = this.months;
        var obj = {}
        var resTemp = res.filter(result=>{
          return result.MONTH <= moment().format('MM');
        })


        resTemp.map((dataset,ndx)=>{
            var label='' 
            var index = parseInt(dataset[dimension.split(',')[0]]-1);
            data[index] = dataset['total']||null

            if( obj[ dataset[dimension.split(',')[1]] ] === undefined){
              obj[ dataset[dimension.split(',')[1]] ] = new Array(11)
            }         
            obj[ dataset[dimension.split(',')[1]] ][index ] = dataset['total']||null
        })

        
        console.log(url,resTemp,obj)


        var ndx = 0;
        for(var year in obj){
          if(typeof(backgroundColor)=='object'){
            datasetTemp.push({
              label: year,
              data: obj[year],
              backgroundColor: backgroundColor[ndx]
            })
          } else {
            datasetTemp.push({
              label: year,
              data: obj[year],
              backgroundColor: backgroundColor
            })
          }
          ndx++;
        }

        datasetTemp.sort(function(a,b){
          return a.label - b.label;
        });

        datasets = datasetTemp.filter((v,i)=>{ 
          var dt = moment().subtract(this.maxYears,'years');
          if(!filter){
            return dt.format('YYYY') < parseInt(v.label);
          } else {
            return true;
          }
        })

        console.log(datasets)
      }

      
      if(dimension == 'YEAR'){
        var datasetTemp = [];
        res.map((dataset,ndx)=>{
          labels.push( dataset[dimension] );
          data.push( dataset['total'] );
          
          
          datasetTemp.push({
            label:dataset[dimension]||`Total Potholes Filled By Year ${filter?filter:''}`.trim(),
            data:[dataset['total']],
            backgroundColor:backgroundColor[ndx]
          })
        })

        /*
        datasetTemp = [{
          label:labels||`Total Potholes Filled By Year ${filter?filter:''}`.trim(),
          data,
          backgroundColor
        }]
        */
        datasets = datasetTemp;
      
      }
      

      /*
      if(showYTD){
        var d = new Array()
        var d = datasets.map((dataset,ndx)=>{
          console.log('SHOW_YTD',dataset);
          return this.calculateCumulativeData(dataset,ndx);
        })
        
        datasetTemp = new Array();
        d.forEach((dset,ndx)=>{
            datasetTemp.push(dset[0])
            datasetTemp.push(dset[1])
        })
        datasets = datasetTemp;
      }
      */

      

      

      return({
        chartOptions:{
          //showCount: false,
          onClick:function(e,d,t){
            /*
            switch(dimension){
              case 'MONTH':
                  _self.getData('YEAR').then(res=>{
                    let $potholeBar = document.getElementById('pothole-bar');
                    $potholeBar.data = res;
                  })
                
                break;
              case 'YEAR':
                  _self.getData("MONTH",d[0]._model.label ).then(res=>{
                    let $potholeBar = document.getElementById('pothole-bar');
                    $potholeBar.data = res;
                  })
                break;
            }
            */
          }
        },
        chartData:{
          labels,
          datasets
        }
      });
    })
  }
}




var PHDATA;
var updateCards;
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
  let $container = $('#fepe_pothole_container');

  PHDATA = new PotholeData();
  PHDATA.colours = ['#1170aa','#fc7d0b','#a16bb1','#57606c','#5fa2ce']//['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'];
  PHDATA.maxYears = 5;
  //PHDATA.dimension = 'YEAR'


  var $filters = document.getElementById('filter-button');

  updateCards=function(res,id,showYTD){
    console.debug('updateCards', res, res.chartData.labels);
    //let showYTD = document.getElementById("ytd_toggle").checked;
    var $potholeFilled = document.getElementById(id);
        $potholeFilled.innerHTML = '';
        $potholeFilled.style.fontSize = '0.865em';
          
        
      res.chartData.datasets.forEach((dataset,ndx)=>{
        const $card = document.createElement('cotui-chart');
        const chartColour = dataset.backgroundColor

        const value = dataset.data.reduce((p,c)=>{ return c+=p})
        $card.id = `filled-counts-${dataset.label}`;
        $card.setAttribute('chart-type','card');
        $card.setAttribute('chart-title',dataset.label);
        $card.setAttribute('chart-value', value.toString().formatNumber());
        $card.setAttribute('chart-colour', chartColour );
        $card.setAttribute('card-style', "" );
        $card.setAttribute('style',`margin-bottom: 1em;`);
        $card.setAttribute('caption',`${showYTD?`Year-to-Date`:`Year-End`}`); 
        
        /*
        $card.setAttribute('href', '#filled-counts');
        $card.addEventListener('click',evt=>{
          document.querySelectorAll('.reset-view').forEach($btn=>{$btn.hidden = false});
          var $aria = document.querySelector('.ui-helper-hidden-accessible')
              if($aria){
                $aria.classList.add('sr-only');
                $aria.innerText = `Chart updated to show ${dataset.label} pothole repair data`
              }
          PHDATA.getData('MONTH,YEAR',dataset.label).then(res=>{
            res.chartData.datasets[0].backgroundColor = chartColour;
            $widgetYear.data = res;
          })
        });
        */


        $potholeFilled.append($card);        
      })
  }


  
  document.getElementById('month').setAttribute('data-label','Year-to-Date Pothole Repairs');//`${moment().format('YYYY')}  Pothole Repair`);
  Promise.all([
    PHDATA.getData('MONTH,YEAR',true).then(res=>{
      updateCards(res,'filled-counts-month',true);
    }),
    PHDATA.getData('MONTH,YEAR').then(res=>{ 
      let total = 0;
      let monthNumber;

      res.chartData.datasets.forEach(dataset=>{
        dataset.data.forEach(d=>{ total += d; });
        monthNumber = dataset.data.findIndex(function(ele){ return typeof(ele)!='number'  })
      });
     
      document.getElementById('js-chart-title-month').innerHTML = `Potholes filled for the period January &mdash; ${moment().format('MMMM D')}`
      $widgetMonth.data=res 
    }),
    PHDATA.getData('MONTH,YEAR',false).then(res=>{
      /* Only show last full years */
      let shortListResults = res;
      let datasetRange = res.chartData.datasets.filter(dataset=>{
        return parseInt(dataset.label) < moment().format('YYYY')
      })
      shortListResults.chartData.datasets = datasetRange;
      updateCards(shortListResults,'filled-counts-year');
    }),

    PHDATA.getData('MONTH,YEAR').then(res=>{ 
      
       /* Only show last full years */
       let datasetRange = res.chartData.datasets.filter(dataset=>{
        return parseInt(dataset.label) < moment().format('YYYY')
      })
      res.chartData.datasets = datasetRange;

      document.getElementById('js-chart-title-year').innerHTML = `Potholes filled for the period of January 1 &mdash; December 31`
      document.querySelectorAll('.reset-view__button').forEach($btn=>{
        $btn.addEventListener('click',evt=>{
          evt.target.parentElement.hidden = true;
          PHDATA.getData('MONTH,YEAR').then(res=>{
            $widgetYear.data = res;
          })
        })
      })
      $widgetYear.data=res 
    }),

   
  ]).then(function(arrayOfValuesOrErrors) {
    console.log('All Data Loaded');
  }).catch(err=>{
    $container.innerHTML = '<div class="well">Error loading data</div>'
  })    
});

$(document).ready(function(){
  // var $ytdToggle = document.getElementById('ytd_toggle');
  // var $ytdToggleLabel = $ytdToggle.parentElement.parentElement.querySelector('[for="ytd_toggle"]');
  // var $component = $ytdToggle.parentElement.parentElement
  //     $component.setAttribute('tabindex','0');
  
  // const handleChange = function(evt){

  //   if(!$ytdToggle.checked){
  //     $ytdToggle.checked = true;
  //   } else {
  //     $ytdToggle.checked = false;
  //   }
    
  //   PHDATA.getData('MONTH,YEAR').then(res=>{ 
  //     $widgetMonth.stacked = $ytdToggle.checked;
  //     $widgetMonth.data = res
  //   })
  //   PHDATA.getData('YEAR').then(res=>{ 
  //     $widgetYear.stacked = $ytdToggle.checked;
  //     $widgetYear.data = res
  //   })
  // }

  // $ytdToggleLabel.addEventListener('click',handleChange)
  // $component.addEventListener('keydown',evt=>{
  //  if(evt.keyCode == 32) handleChange();
  // })
  // $ytdToggle.parentElement.addEventListener('click',handleChange)


  // // MTD Toggle
  // var $monthToggle = document.getElementById('month_toggle');
  // var $monthToggleLabel = $monthToggle.parentElement.parentElement.querySelector('[for="month_toggle"]');
  // var $componentMonth = $monthToggle.parentElement.parentElement
  //     $componentMonth.setAttribute('tabindex','0');
      
  
  // const handleMonthChange = function(evt){
  //   if(!$monthToggle.checked){
  //     $monthToggle.checked = true;
  //     PHDATA.dimension = 'MONTH,YEAR';
  //     //PHDATA.filter = null;
  //     PHDATA.getData().then(res=>{
  //       $widgetMonth.data = res;
  //     })
  //   } else {
  //     $monthToggle.checked = false;
  //     PHDATA.dimension = 'YEAR';
  //     PHDATA.colours = colours;
  //     //PHDATA.filter = null;
  //     PHDATA.getData().then(res=>{
  //       $widgetMonth.stacked = false;
  //       $widgetMonth.data = res;
  //     })
  //   }
    
  // }

  // $monthToggleLabel.addEventListener('click',handleMonthChange)
  // $componentMonth.addEventListener('keydown',evt=>{
  //  if(evt.keyCode == 32) handleMonthChange();
  // })
  // $monthToggle.parentElement.addEventListener('click',handleMonthChange)
});
