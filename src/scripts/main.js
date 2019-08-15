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
    this.url = '/*@echo DATA*/?$format=json&unwrap=true';
    this.months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    this.colours = ['#20313F','#204854','#1C6166','#207B71','#359576','#58AE75','#83C670','#B5DC6A','#EFEE66'].reverse();
  }
  

  

  getData(dimension,filter){
    
    
    
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
        return `${d} desc`
      }).join(',');
    })();

    console.log(orderby);

    return getJSON(`${this.url}&$apply=${filter?`filter(YEAR eq '${filter}')/`:``}groupby((${dimension}))/aggregate(POTHOLESFILLED with sum as total)&$orderby=${orderby}`).then(res=>{

      var datasets = [];
      var labels = []; 
      var data =[];
      var backgroundColor;
      if(dimension != 'YEAR'){
        backgroundColor = this.colours;
        labels = this.months;
        var obj = {}
        res.map((dataset,ndx)=>{
          var label='' 
          var index = parseInt(dataset[dimension.split(',')[0]]-1);
          data[index] = dataset['total']||null
          if( obj[ dataset[dimension.split(',')[1]] ] === undefined){
            obj[ dataset[dimension.split(',')[1]] ] = new Array(11);
          }
          obj[ dataset[dimension.split(',')[1]] ][index ] = dataset['total']||null
        })

        var ndx = 0;
        for(var year in obj){
          datasets.push({
            label: year,
            data: obj[year],
            backgroundColor:backgroundColor[ndx]
          })
          ndx++
        }

        datasets.sort(function(b,a){
          return a.label - b.label;
        });
      }

      if(dimension == 'YEAR'){
        backgroundColor = '#655d6b';
        res.map((dataset,ndx)=>{
          labels.push( dataset[dimension] );
          data.push( dataset['total'] );          
        })

        datasets = [{
          label:'Total Potholes',
          data,
          backgroundColor
        }]
      }



      return({
        chartOptions:{
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
  let container = $('#fepe_pothole_container');



  var phdata = new PotholeData();
  var colours=['#070f2b','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6'];
  phdata.getData('YEAR').then(res=>{
    let $potholeBar = document.getElementById('pothole-bar');
    $potholeBar.data = res;
    
    res.chartData.labels.forEach((label,ndx)=>{
      const $card = document.createElement('cotui-chart');
      $card.id = `filled-counts-${label}`;
      $card.setAttribute('chart-type','card');
      $card.setAttribute('chart-title',`${label}`);
      $card.setAttribute('chart-value', res.chartData.datasets[0].data[ndx].toString().formatNumber());
      $card.setAttribute('chart-colour', '#655d6b');
      $card.setAttribute('style',``);
      $card.caption = "Last Updated";
      //$card.data = phYTD.chartData.datasets[0].data[ndx].toString().formatNumber();
      if(ndx < 5)  $potholeFilled.append($card);
    })
    
  });
  






  
  let $potholeFilled = document.getElementById('filled-counts');
  $potholeFilled.style.fontSize = '0.865em';
 


  // DataFilters Update Chart Based on function
    var widget = document.getElementById('pothole-bar');
    var $filters = document.getElementById('filter-button');

    //$filters.style.display='none';
    [{
      label:'Years',
      func:'YEAR'
    },{
      label:'Months',
      func:'MONTH,YEAR'
    }].forEach(btn=>{
      var $btn = document.createElement('button');
      $btn.type = 'button';
      $btn.classList.add('btn');
      $btn.classList.add('btn-default');
      $btn.innerText = btn.label;
      $btn.addEventListener('click',(evt)=>{
        evt.preventDefault();
        phdata.getData(btn.func).then(res=>{
          widget.data = res;
        })
        
        /*
        widget.getPlugin().then(ChartJS=>{
          ChartJS.chart.data = phdata.getData(btn.func).chartData;
          ChartJS.chart.update();
        })
        */
      })
      $filters.append($btn);
    })





});


