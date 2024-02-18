/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/lhccustodio/projetos/sapbas/odata/nw/model/models",
        'sap/ui/model/json/JSONModel',
        'sap/f/library',
        'sap/f/FlexibleColumnLayoutSemanticHelper',
    ],
    function (UIComponent, Device, models, JSONModel, fioriLibrary, FlexibleColumnLayoutSemanticHelper) {
        "use strict";

        return UIComponent.extend("com.lhccustodio.projetos.sapbas.odata.nw.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {                
                var oModel,
    				oProductsModel,
				    oRouter;

                var oDataServiceUrl = this.getMetadata().getManifestEntry("sap.app").dataSources["mainService"].uri;
                console.log("Component.js [onInit] oDataServiceUrl ->",oDataServiceUrl);                
                localStorage.setItem('oDataServiceUrl', oDataServiceUrl); 

                //this.setModel(oNWModel, 'products');

                UIComponent.prototype.init.apply(this, arguments);
                // Não retirar esta linha (Router para de funcionar)
                oModel = new JSONModel();
                this.setModel(oModel);

                var oNWModel = new sap.ui.model.odata.v2.ODataModel(oDataServiceUrl, {
                    useBatch : true
                    });
                //console.log("Component.js [onInit] oModelnw ->",oNWModel);
                this.setModel(oNWModel,'NorthWind');                
                
                //this.setModel(new sap.ui.model.json.JSONModel(),'productSummary');   
                //sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(), 'NorthWind3');             

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                oRouter = this.getRouter();
                oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
                oRouter.initialize();
            },

            getHelper: function () {
                return this._getFcl().then(function(oFCL) {
                    var oSettings = {
                        defaultTwoColumnLayoutType: fioriLibrary.LayoutType.TwoColumnsBeginExpanded,
                        defaultThreeColumnLayoutType: fioriLibrary.LayoutType.ThreeColumnsMidExpanded,
                        initialColumnsCount: 1,
                        maxColumnsCount: 2
                    };
                    return (FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings));
                });
            },

            _onBeforeRouteMatched: function(oEvent) {
                var oModel = this.getModel(),
                    sLayout = oEvent.getParameters().arguments.layout,
                    oNextUIState;

                console.log("Component.js [_onBeforeRouteMatched]: sLayout ->",sLayout);    
    
                /* 
                  Se não tem o parametro "layout" então define como "OneColumn")
                  Outros possiveis valores sem fullscreen:

                  OneColumn -> Mostra a coluna inicial em 100%.
                               Para fazer a transição entre os tipo de layout é necessário
                               configurar um evento, objeto, etc para controlar esse comportamento
                               no controller da view no caso aqui a Master
                               exemplo:
                                    Master.view
                                    <ColumnListItem type="Navigation" press=".onListItemPress">
                                    Master.controller
                               		onListItemPress: function () {
                                            var oFCL = this.oView.getParent().getParent();

                                            oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
                                        }

                  TwoColumnsBeginExpanded -> Mostra a coluna inicial se possível totalmente e
                                             a ajusta a segunda coluna com restante (70/30)
                  TwoColumnsMidExpanded   -> o contário da de cima (30/70)

                  ThreeColumnsBeginExpandedEndHidden
                  ThreeColumnsEndExpanded
                  ThreeColumnsMidExpanded
                  ThreeColumnsMidExpandedEndHidden
                
                */

                if (!sLayout) {
                    this.getHelper().then(function(oHelper) {
                        oNextUIState = oHelper.getNextUIState(0);
                        oModel.setProperty("/layout", oNextUIState.layout);
                    });
                  return; 
                }
    
                oModel.setProperty("/layout", sLayout);
                oModel.setProperty("/ProductID","0");
            },
            _getFcl: function () {
                return new Promise(function(resolve, reject) {
                    var oFCL = this.getRootControl().byId('flexibleColumnLayout');
                    console.log("Component.js [_getFcl]: oFCL ->",oFCL);    
                    if (!oFCL) {
                        this.getRootControl().attachAfterInit(function(oEvent) {
                            resolve(oEvent.getSource().byId('flexibleColumnLayout'));
                        }, this);
                        return;
                    }
                    resolve(oFCL);
    
                }.bind(this));
            }
        });
    }
);