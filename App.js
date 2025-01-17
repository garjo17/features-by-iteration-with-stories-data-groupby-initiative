Ext.define('CustomApp', {
    extend: 'Rally.app.App',      
    componentCls: 'app',       
  
  
  // Entry Point to App
  launch: function() {
  
    console.log('App for Caixabank');    
    this.pulldownContainer = Ext.create('Ext.container.Container', {    
      id: 'pulldown-container-id',
      layout: {
              type: 'hbox',          
              align: 'stretch'
          }
    });
  
     this.add(this.pulldownContainer); 
  
     this._loadIterations();
  },
  
  // create iteration pulldown and load iterations
  _loadIterations: function() {
       
  
      this.allUserStories = Ext.create('Ext.Container', {
          items: [{
              xtype: 'rallycheckboxfield',
              fieldLabel: '-  All User Stories:',
              name: 'mycheckbox',
              id: 'alluserstories',
              value: false,
              listeners: {
                  change: function() { 
                      this._makeStore();
                 },
              
                 
                 scope: this
               }
          }],
          renderTo: Ext.getBody().dom
      });
  
      
      this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
        fieldLabel: 'Iteration',
        labelAlign: 'right',
        width: 370,
        listeners: {
            ready: function() {             
                 this._makeStore();
           },
        select: function() {   
                 this._makeStore();
           },
           scope: this
         }
      });  
      
      
      this.pulldownContainer.add(this.iterComboBox);   
      this.pulldownContainer.add(this.allUserStories); 
    
      
   },
  
  // Get data from Rally
  
  _makeStore: function() {
      
      Ext.create('Rally.data.wsapi.Store', {
          model: 'PortfolioItem/Feature',
          //context: this.getContext(),
          fetch: ['FormattedID','Name','State','Parent', 'Project', 'Release','Owner', 'Description',
                  'PercentDoneByStoryCount','PercentDoneByStoryPlanEstimate',
                 'AcceptedLeafStoryCount','LeafStoryCount','ActualEndDate','ActualStartDate','PlannedStartDate','PlannedEndDate'],
        //  pageSize: 1000,
          autoLoad: true,
          
          listeners: {
              load: this._onDataLoaded,
              scope: this
          }
      }); 
     
  },
  
  _onDataLoaded: function(store, data){
      var features = [];
      var pendingstories = data.length;
      if (data.length ===0) {
              this._createGrid(features);  
      }
      //console.log(data); 
      _.each(data, function(feature) {
                  var numStories = 0 ;	
  
                  var ActualTotal = 0 ;
                  var EstimateTotal =  0;
                  var RemainingTotal = 0 ;
  
                  var featureRelease = (feature.get('Release')) ? feature.get('Release')._refObjectName : "None";
                  var featureProject = feature.get('Project')._refObjectName;
                  var featureState = (feature.get('State')) ? feature.get('State')._refObjectName : "None" ;  
  
                  var featureName = feature.get('Name');
              //    console.log('NOMBRE FEATURE :', featureName);
                 
                  var f  = {
                      FormattedID: feature.get('FormattedID'),
                      Name: feature.get('Name'),
                      _ref: feature.get("_ref"),
                      Release: featureRelease,
                      Project: featureProject,
                      State: featureState,
                      Iniciative: (feature.get('Parent') && feature.get('Parent')._refObjectName) || 'None',
                      Owner: (feature.get('Owner') && feature.get('Owner')._refObjectName) || 'None',
                      PercentDoneByStoryCount: feature.get('PercentDoneByStoryCount'),
                      PercentDoneByStoryPlanEstimate: feature.get('PercentDoneByStoryPlanEstimate'),
                      ActualStartDate: feature.get('ActualStartDate'),
                      PlannedStartDate: feature.get('PlannedStartDate'),
                      AcceptedLeafStoryCount: feature.get('AcceptedLeafStoryCount'),
                      LeafStoryCount: feature.get('LeafStoryCount'),
                      PlannedEndDate: feature.get('PlannedEndDate'),
                      EstimateTotal: EstimateTotal,
                      ActualTotal:RemainingTotal,
                      RemainingTotal:RemainingTotal,
                      UserStories: []
                  };
                  
                  var stories = feature.getCollection('UserStories', {fetch: ['FormattedID',
                                                                              'ScheduleState',
                                                                              'Owner',
                                                                              'Iteration',
                                                                              'State',
                                                                              'Release',
                                                                              'Name',
                                                                              'TaskActualTotal',
                                                                              'TaskEstimateTotal',
                                                                              'TaskRemainingTotal'
                                                                            ]
                                                                      });
                                                      
                  stories.load({
                      callback: function(records){
                                                   
                          _.each(records, function(story){
                              var storyIteration = (story.get('Iteration')) ? story.get('Iteration')._refObjectName : "None" ;
                              var storyName = story.get('Name'); 
                              var storyProject = story.get('Project')._refObjectName;
                              
  
                              ActualTotal +=  story.get('TaskActualTotal');
                              EstimateTotal +=  story.get('TaskEstimateTotal');
                              RemainingTotal +=  story.get('TaskRemainingTotal'); 
  
  
                              
                              if ( storyIteration === this.iterComboBox.getRecord().get('Name')){
                                 
                                  numStories = numStories + 1 ;
                                  f.UserStories.push({
                                  _ref: story.get('_ref'),
                                  FormattedID: story.get('FormattedID'),
                                  ScheduleState: story.get('ScheduleState'),
                                  Iteration: storyIteration ,
                                  Project: storyProject,
                                  Name: storyName,
                                  Owner:  (story.get('Owner') && story.get('Owner')._refObjectName) || 'None',
                                  TaskActualTotal: story.get('TaskActualTotal'),
                                  TaskEstimateTotal: story.get('TaskEstimateTotal'),
                                  TaskRemainingTotal: story.get('TaskRemainingTotal')
                                  
                                  });
                                 
                                                                  
                              } else if ( this.down('#alluserstories').getValue())  {
                                  
                                  f.UserStories.push({
                                  _ref: story.get('_ref'),
                                  FormattedID: story.get('FormattedID'),
                                  ScheduleState: story.get('ScheduleState'),
                                  Iteration: storyIteration ,
                                  Project: storyProject,
                                  Name: storyName,
                                  Owner:  (story.get('Owner') && story.get('Owner')._refObjectName) || 'None',
                                  TaskActualTotal: story.get('TaskActualTotal'),
                                  TaskEstimateTotal: story.get('TaskEstimateTotal'),
                                  TaskRemainingTotal: story.get('TaskRemainingTotal')
  
                                  });
  
                               
                              }
      
                          }, this);
  
                          if (numStories !== 0 ) {
                                f.EstimateTotal = EstimateTotal ;
                                f.ActualTotal = ActualTotal ;
                                f.RemainingTotal = RemainingTotal ;
                                features.push(f);
                              }
                          //--pendingstories;
                          if (--pendingstories === 0) {
                              this._createGrid(features);
                          }
                            
                      },
                      scope: this
                     
                  });
                          
      }, this);
  },
  
  _createGrid: function(features) {
  var featureStore = Ext.create('Rally.data.custom.Store', {
      data: features,
      pageSize: 1000,
      remoteSort:false,
      groupField: 'Iniciative'
  });
  
  if (!this.down('#fgrid')){
  
  this.add({
  xtype: 'rallygrid',
  itemId: 'fgrid',
  store: featureStore,
  features: [{ftype:'groupingsummary'}],
  
  columnCfgs: [
      {
         text: 'ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
          tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
      },
      
      {
          text: 'Name', dataIndex: 'Name'
      },
      
      {
        text: 'Project(team)', dataIndex: 'Project'
      },
      {
        text: 'Owner', dataIndex: 'Owner'
      },
      {
        xtype: 'templatecolumn',
        text: 'Planned Start Date',
        tpl: Ext.create('Rally.ui.renderer.template.DateTemplate', {fieldName: 'PlannedStartDate'})
      },
      {
        xtype: 'templatecolumn',
        text: 'Planned End Date',
        tpl: Ext.create('Rally.ui.renderer.template.DateTemplate', {fieldName: 'PlannedEndDate'})
      },
      {
        xtype: 'templatecolumn',
        text: '% Done by Story Count',
        dataIndex: 'PercentDoneByStoryCount',
        tpl: Ext.create('Rally.ui.renderer.template.progressbar.PercentDoneByStoryCountTemplate')
      },
      {
          xtype: 'templatecolumn',
          text: '% Done by Story Points Count',
          dataIndex: 'PercentDoneByStoryPlanEstimate',
          tpl: Ext.create('Rally.ui.renderer.template.progressbar.PercentDoneByStoryPlanEstimateTemplate')
      },
      {
        text: 'US Accepted', dataIndex: 'AcceptedLeafStoryCount'
  
      },
      {
        text: 'US Totales', dataIndex: 'LeafStoryCount'
  
      },
      
      {
        text: 'Feature Release', dataIndex: 'Release'
  
      },
      {
        text: 'Hours Estimate', dataIndex: 'EstimateTotal'
  
      },
      {
        text: 'Hours Actual', dataIndex: 'ActualTotal'
  
      },
      {
        text: 'Hours Remaining', dataIndex: 'RemainingTotal'
  
      },
      {
          text: 'User Stories', dataIndex: 'UserStories', flex: 1,
          renderer: function(value) {
              var html = [];
              html.push(
                '<table class="tb" style="">' +
                          '<style>' +
                              '.tb { border-collapse: collapse; }' +
                              '.tb th, .tb td { padding: 2px; border: solid 1px #777; }' +
                              '.tb th { background-color: lightblue; }' +
                          '</style>' +
                          '<thead>' +
                          '<tr>' +
                              '<th> Link-ID </th>'+
                              '<th> Name </th>' +
                              '<th> State </th>' +
                              '<th> Iteration </th>'+
                              '<th> Estimate </th>' +
                              '<th> Actual </th>' +
                              '<th> Remainin </th>' +
                          '</tr>' +
                          '</head>' +
                          '<tbody>'
              );
  
              _.each(value, function(userstory){
                 
                    html.push(
                    '<tr> '+
                    '<td>' +
                        '<a href="#" onclick=Rally.nav.Manager.showDetail("' + userstory._ref +'") )>'+
                        '<img src="https://rally1.rallydev.com/slm/images/icon_edit.gif"></a>'+ 
                        '<b> '+  userstory.FormattedID +
                        '</a></b>' +  '</td>' + 
                    '<td>'+ userstory.Name + '</td>' +
                    '<td>'+ userstory.ScheduleState + '</td>' +
                    '<td>'+ userstory.Iteration +  '</td>' +
                    '<td>'+ userstory.TaskEstimateTotal + '</td>' +
                    '<td>'+ userstory.TaskActualTotal + '</td>' +
                    '<td>'+ userstory.TaskRemainingTotal + '</td>' +
                '</tr>'
                  
                   );
                
              });
  
              html.push( 
                '</tbody>' +
                 '</table>' );
  
              return html ;  //.join('<br/>');
              
          }
  
      },
     
  ]
  
  });
  }
  else{
  this.down('#fgrid').reconfigure(featureStore);
  }
  }
  
  
  
  });