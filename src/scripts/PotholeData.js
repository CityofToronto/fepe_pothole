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
      const url = showYTD?'/*@echo DATA_YTD*/?$format=json&unwrap=true':'/*@echo DATA_ANNUAL*/?$format=json&unwrap=true';
            
      var orderby = (function(){
        return dimension.split(',').map(d=>{
          return `${d} asc`
        }).join(',');
      })();
      
      

      return fetch(`${url}&$apply=${filter?`filter(YEAR eq '${filter}')/`:``}groupby((${dimension}))/aggregate(POTHOLESFILLED with sum as total)&$orderby=${orderby}&t=${new Date().getTime()}`).then(res=>{return res.json()}).then(res=>{
        console.log('getJSON-updated',filter, res)
        var datasets = [];
        var labels = []; 
        var data =[];
        var backgroundColor = this.colours;
  
        if(dimension != 'YEAR'){
          let datasetTemp = [];
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
          let datasetTemp = [];
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