sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.lhccustodio.projetos.sapbas.odata.nw.controller.ctrlPrincipal", {
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
/*
			var oBaseModel = this.oOwnerComponent.getModel("NorthWind");

			oBaseModel.read("/Products",{
					urlParameters: {
						$expand: "Category,Supplier"
					},									
					success: function(oData2) {
						//Create JSON Model						
						console.log("ctrlPrincipal.js: [onInit] NorthWind2");    
						var oODataJSONModel = new sap.ui.model.json.JSONModel();
						oODataJSONModel.setData(oData2.results);
						//alert(JSON.stringify(oData2));
						//this.getView().setModel(oODataJSONModel);
						sap.ui.getCore().setModel(oODataJSONModel, 'NorthWind2');
						//oTable.setModel(oODataJSONModel);					
						//oTable.bindRows("/modelData");
					}
				},this);	*/
		},

		onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			this._updateUIElements();

			// Save the current route name
			this.currentRouteName = sRouteName;
			this.currentProduct = oArguments.product;
			this.currentSupplier = oArguments.supplier;

			console.log("ctrlPrincipal.js: [onRouteMatched] currentRouteName ->",sRouteName);    
			console.log("ctrlPrincipal.js: [onRouteMatched] currentProduct ->",this.currentProduct);    
			console.log("ctrlPrincipal.js: [onRouteMatched] currentSupplier ->",this.currentSupplier);    			
		},

		onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");
			
			this._updateUIElements();	

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.currentRouteName, {layout: sLayout, product: this.currentProduct, supplier: this.currentSupplier}, true);
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
			var oModel = this.oOwnerComponent.getModel(),
				oUIState;
			
			console.log("ctrlPrincipal.js: oModel ->",oModel);    	
			this.oOwnerComponent.getHelper().then(function(oHelper) {
				oUIState = oHelper.getCurrentUIState();
				oModel.setData(oUIState);
			});
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
		}
	});
});
