sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/f/library',
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	"sap/m/MessageBox",
	'sap/m/MessageToast',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/ui/core/Fragment',
	'sap/m/MessageItem',
	'sap/m/MessageView',
	'sap/m/Popover',
	'sap/m/Link',	
	'sap/ui/core/IconPool',
	"sap/ui/core/Popup"
], function (Controller, fioriLibrary, JSONModel, NumberFormat, FlattenedDataset, 
	         FeedItem, MessageBox, MessageToast, ChartFormatter, Fragment,
			 MessageItem,MessageView,Popover,Link, IconPool,Popup) {
	"use strict";

	return Controller.extend("com.lhccustodio.projetos.sapbas.odata.nw.controller.ctrlProducDetail", {		
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oView = this.getView();
			this.oBaseModel = oOwnerComponent.getModel("NorthWind");
			this.modelSVP = new sap.ui.model.json.JSONModel({"produto":{}}); // Redutor Sumario Vendas Produto
			this.modelVPA = new JSONModel(); // Redutor Vendas Produto Ano

			this.oView.setModel(this.oBaseModel);			
			this.oView.setModel(this.modelSVP,'productSummary');			
			this.oView.setModel(this.modelVPA,"treeVendasModel");

			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
			//this.oRouter.getRoute("SupplierDetail").attachPatternMatched(this._onProductMatched, this);			
		},
		onSupplierPress: function (oEvent) {
			var supplierPath = oEvent.getSource().getBindingContext("products").getPath(),
				supplier = supplierPath.split("/").slice(-1).pop();

			this.oRouter.navTo("SupplierDetail", {layout: fioriLibrary.LayoutType.ThreeColumnsMidExpanded, supplier: supplier, product: this._product});
		},
		promiseProductData: function(productID){
			console.log(productID);
			return new Promise(function (resolve, reject) {
				// "/Order_Details?$filter=ProductID eq !ProductID&$expand=Order&$orderby=Order/OrderDate&$select=ProductID,Order/OrderDate,UnitPrice,Quantity&$format=json";
				
				this.oBaseModel.read("/Order_Details",{
					urlParameters: {
						$filter: "ProductID eq " + this._product,
						$expand: "Order,Product",						
						$select: "Product/ProductID,Product/ProductName,\
						          Product/UnitsInStock,Product/QuantityPerUnit,Product/UnitPrice,\
								  Product/Discontinued,Product/SupplierID,Product/CategoryID,\
								  Order/OrderDate,UnitPrice,Quantity",
						$orderby: "Order/OrderDate"
					},
					success: function (oData) 
					 { 
					   resolve(oData);
					 },
					error: function(oError)
					 { reject(oError);} 
			});
		}.bind(this))},	
		getOrnewSumarioProduto(tipo,jsoVendas,jsoProduct){		  			
		  let jsoVenda = null,bExiste = false;
		  if (tipo == "Geral") {
			for (jsoVenda of jsoVendas) {
				if (jsoVenda.orderDate == jsoProduct.Order.OrderDate) 
				{ 
					jsoVenda.ordersInDay++;bExiste = true;
					break;				
				}
			};	

			if (!bExiste) {
			 jsoVenda = {
							orderDate: jsoProduct.Order.OrderDate,
							orderYear: jsoProduct.Order.OrderDate.getFullYear(),
							ordersInDay: 1,
							totalQuantity: 0,
							totalPrice: 0,
						}
				}
			jsoVenda.totalQuantity += jsoProduct.Quantity;
			jsoVenda.totalPrice += jsoProduct.Quantity * jsoProduct.UnitPrice;
		  }		 		 
		 return jsoVenda;
		},			
		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			console.log("ctrlProductDetais.js [_onProductMatched]: _product ->",this._product);    

			var oProductData = this.promiseProductData(this._product);
			oProductData.then(function(data) {									 				
				let qtdTotal = 0;
				let vlrTotal = 0.00;
				let jsoDataModel = { // Dados principais do produto obtidos na 1a posicao do array
										productID: data.results[0].Product.ProductID,
										productName: data.results[0].Product.ProductName,
										productUnitsInStock: data.results[0].Product.UnitsInStock,
										productQuantityPerUnit: data.results[0].Product.QuantityPerUnit,
										productUnitPrice: data.results[0].Product.UnitPrice,
										productDiscontinued: data.results[0].Product.Discontinued,
										productSupplier: data.results[0].Product.SupplierID,
										productCategory: data.results[0].Product.CategoryID,
										productDescription: "Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy\
										                     eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",										
										productOrdersQuantity: 0,
										productOrdersTotal: 0.00,
										productVendasGeral: [],
										productVendasAnual: [],										
									}				
				data.results.forEach((prod,i) => {
				//console.log("ctrlProductList.js: [_onProductMatched] data ->",prod);
				    jsoDataModel.productVendasGeral.push(this.getOrnewSumarioProduto('Geral',jsoDataModel.productVendasGeral,prod));
					//jsoDataModel.productVendasAnual.push(this.getOrnewSumarioProduto('Anual',jsoDataModel.productVendasAnual,prod));
					jsoDataModel.productOrdersQuantity += prod.Quantity;
					qtdTotal += prod.Quantity					   
					jsoDataModel.productOrdersTotal += prod.Quantity * prod.UnitPrice;	   					   
					vlrTotal += jsoDataModel.productOrdersTotal;
				});
				jsoDataModel.firstDataPoint = jsoDataModel.productVendasGeral[0].orderDate;
				let nEndArray = jsoDataModel.productVendasGeral.length - 1;
				jsoDataModel.lastDataPoint = jsoDataModel.productVendasGeral[nEndArray].orderDate;
				
				//let oModel =  new sap.ui.model.json.JSONModel({"produto":jsoDataModel});
				this.modelSVP = new sap.ui.model.json.JSONModel({"produto":jsoDataModel});
				
				//new JSONModel(jsoDataModel); // this.getView().getModel('productSummary');
				//oModel.setData(jsoDataModel);
				this.getView().setModel(this.modelSVP,'productSummary');
				
				this.getView().bindElement({
					path: "/",
					model: "productSummary"					
				});
				
				this.getView().byId('onVenda').setNumber(qtdTotal);				
				let oFloatFormat = NumberFormat.getFloatInstance({style: "short",decimals: 2,shortDecimals: 2});					
				this.getView().byId('onVenda').setUnit('/' + oFloatFormat.format(vlrTotal) + " BRL");
				let jsoGraphicOptions = {"op" : [
					{
					"key" : "0", "text" : "Gráfico vendas de " + jsoDataModel.firstDataPoint.getFullYear() + ' a ' + jsoDataModel.lastDataPoint.getFullYear()
					}
				   ]
				}
                let nAtualYear = 0;
				jsoDataModel.productVendasGeral.forEach((item,index) =>{
					if (nAtualYear != item.orderYear) {
					 nAtualYear = item.orderYear;
					 jsoGraphicOptions["op"].push({"key" : `${nAtualYear}`, "text" : "Gráfico vendas de " + nAtualYear});
					}
				});

				let oModelGraphicOptions =  new JSONModel(jsoGraphicOptions);
				let oSelectGraphicType = this.getView().byId("SelectGraphicType");
				oSelectGraphicType.setModel(oModelGraphicOptions);		
								
				let oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
				oVizFrame.destroyDataset();
                oVizFrame.destroyFeeds();
				oVizFrame.setVizType("timeseries_line");

				oVizFrame.setModel(this.modelSVP);

				var oDatasetCol = new FlattenedDataset( {
					dimensions: [ {
						name: 'Date',
						value: "{orderDate}",
						dataType: 'date'
					}],
					measures: [ {
						name: 'Vendas Totais',
						value: '{totalPrice}'						
					}],
					data: {
						path: "/produto/productVendasGeral"
					}
				});

				try {
					oVizFrame.setDataset(oDatasetCol);						
			    } catch (error) {
				  console.error(error);
				  // Expected output: ReferenceError: nonExistentFunction is not defined
				  // (Note: the exact output may be browser-dependent)
			    }
			  		
				oVizFrame.setVizProperties( {
					general: {
						layout: {
							padding: 0.04
						}
					},				
					valueAxis: {
						visible: true,
						title: {
							visible: false
						}
					},
					timeAxis: {
						visible: true,
						label: {
							formatString:ChartFormatter.DefaultPattern.SHORTFLOAT
						},

						title: {
							visible: false
						},
						interval : {
							unit : ''
						}
					},
					plotArea: {
						window: {
							start: "firstDataPoint",
							end: "lastDataPoint"
						},
						dataLabel: {
							formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
							visible: false
						}
					},
					legend: {
						title: {
							visible: true
						}
					},
					title: {
						visible: false
					},
					interaction: {
						syncValueAxis: true
					}
				});
				
				var feedValueAxis = new FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': ["Vendas Totais"]
				});

				var feedTimeAxis = new FeedItem({
                    'uid': "timeAxis",
                    'type': "Dimension",
                    'values': ["Date"]
                });

				oVizFrame.addFeed(feedValueAxis);
				oVizFrame.addFeed(feedTimeAxis);
/*
				let timerId = setInterval((oButton) => {
					oButton.removeStyleClass("shake-vertical");
				    oButton.addStyleClass("shake-vertical");
				}, 5000,this.getView().byId('gtVendas')
			      );
				  */
				
				setTimeout(function(oButton) {
					oButton.removeStyleClass("shake-vertical");
					oButton.addStyleClass("shake-vertical");					
				},5000,this.getView().byId('gtVendas'));
			

				}.bind(this)).catch(function(oError) {
				// erro
			}.bind(this));			
		},
		onEditToggleButtonPress: function() {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();

			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},

		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},

		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},
		
		onExit: function () {
			this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
		},		
		encodeImage : function (sVal) {
			var sTrimmed;
			if(typeof sVal === "string"){
			   if (sVal.indexOf("base64") < 0)	
			    {
			      sTrimmed = sVal.substr(104);
			      return "data:image/bmp;base64," + sTrimmed;
				}
			  return sVal 	
			}                          
		  },
		onYearChartChanged : function(oEvent){
			let nSelectedYear = parseInt(oEvent.getSource().getSelectedKey());
            if (this.oVizFrame){                			
				switch (nSelectedYear){
                    case 0:
						// Remove qualquer filtro aplicado
						this.oVizFrame.getDataset().getBinding("data").filter([]);
                        break;
                    default:
						let oFilterYear = new sap.ui.model.Filter("orderYear",sap.ui.model.FilterOperator.EQ,nSelectedYear);   			
				        this.oVizFrame.getDataset().getBinding("data").filter([oFilterYear]);
                        break;
                }
            }
        },
		onNotImplemented: () =>{
			MessageBox.information("Esta funcionalidade ainda não foi implementada.", {title: "Ah, não!"});
		},
		onButtonDelete: function () {
			MessageBox.confirm("Deseja realmente excluir este produto ?", {title: "Tem certeza!",			
				actions: ["Manage Products", sap.m.MessageBox.Action.CLOSE],
				styleClass: "tilt-in-tr",
				onClose: function(sAction) {
					MessageToast.show("Action selected: " + sAction);
				}
			});
		},
		onPressViewVendas: function(oEvent,oThis) {
			//Popup.setWithinArea(this.byId("withinArea"));

			var oButton = oEvent.getSource(),
				oView = this.getView();

			// Create popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "com.lhccustodio.projetos.sapbas.odata.nw.fragment.ListaVendasPopup",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);		
					return oPopover;
				}.bind(this));
			}
			this._pPopover.then(function(oPopover) {
				let oTree = this.byId("treeVendasProduto");					
				oTree.setModel(this.modelVPA);					
				
				// Carrega Vendas Produto por Ano
				this.loadVPA(this.modelVPA);										
				oPopover.openBy(oButton);

			}.bind(this));
		},
		onToggleOpenState: function(oEvent) {
			var iItemIndex = oEvent.getParameter("itemIndex");
			var oItemContext = oEvent.getParameter("itemContext");
			var bExpanded = oEvent.getParameter("expanded");

			MessageToast.show("Item index: " + iItemIndex
							  + "\nItem context (path): " + oItemContext
							  + "\nExpanded: " + bExpanded,
				{
					duration: 5000,
					width: "auto"
				});

			var oTree = this.byId("treeVendasProduto");
			var oModel = oTree.getModel();
			var sPath = oItemContext.getPath();
			var bChildIsDummyNode = oModel.getProperty(sPath + "/nodes/0").dummy === true;
			let jsoKey = oModel.getProperty(sPath).data; // Pega o Item do Model a ser utilizado
			let nLevel = oTree.getItems()[iItemIndex].getLevel();

			if (bExpanded && bChildIsDummyNode) {
				this.loadVPA(oModel, sPath, nLevel, jsoKey);
			}
		},
		loadVPA: function(oModel, sPath, iLevel, jsoKey) {
			let oTree = this.byId("treeVendasProduto");	
			let nAtualYear = 0;
			let sAtualMonth = "";
			let aNodes = [];
			let aVendasGeral = this.modelSVP.getData().produto.productVendasGeral;
			let oFloatFormat = NumberFormat.getFloatInstance({decimals: 2,shortDecimals: 2});											
						
			// In this example we are just pretending to load data from the backend.
			oTree.setBusy(true);
			let nVendas = 0;
			let nQtdVendas = 0;
			let nTotalVendas = 0.00;
			setTimeout(function() {
				if (jsoKey == null){
				  aVendasGeral.forEach((item,index) =>{				 	
				  if (nAtualYear != item.orderYear) {
				   nAtualYear = item.orderYear;
				   nQtdVendas = item.totalQuantity;
				   nTotalVendas = item.totalPrice;
				   nVendas = 1;
   
				   aNodes.push({
								text: nAtualYear,
								data: {"year":nAtualYear},
								nodes: [{ // This dummy node is required to get an expandable item.
										  text: "",
										  dummy: !iLevel || iLevel < 5
										}
									   ]
							  });				 
						 }
					else {
						nQtdVendas += item.totalQuantity;
						nTotalVendas += item.totalPrice;
						nVendas++;
						let sNodeText = aNodes[aNodes.length - 1].data.year.toString();						
						aNodes[aNodes.length - 1].text = sNodeText + " V: " + nVendas + " Qtde: " + nQtdVendas + " Total: " + oFloatFormat.format(nTotalVendas) + " BRL";
					}
					 });							   
				 }
				 else if (iLevel == 0){		
					 let nIndex;			
					 let sNodeText;
					 aVendasGeral.forEach((item,index) =>{
						 if (jsoKey.year == item.orderYear.toString()) {
						  let sMonthName = item.orderDate.toLocaleString('default', { month: 'long' });
						  if (sAtualMonth !== sMonthName) {
						   sAtualMonth = sMonthName;
						   nQtdVendas = item.totalQuantity;
						   nTotalVendas = item.totalPrice;
						   nVendas = 1;						   
						   aNodes.push({
										text: sMonthName,										
										nodes: [{ // This dummy node is required to get an expandable item.
												 text: iLevel === 5 ? "Last node" : "",
												 dummy: !iLevel || iLevel < 5
												}
											   ],
										data: {"year":item.orderYear,"month":sAtualMonth}
									  });				 
						   nIndex = aNodes.length - 1;
						   sNodeText = aNodes[nIndex].data.month;
						   aNodes[nIndex].text = sNodeText + " V: " + nVendas + " Qtde: " + nQtdVendas + " Total: " + oFloatFormat.format(nTotalVendas) + " BRL"
						 }
						else {
							   nQtdVendas += item.totalQuantity;
							   nTotalVendas += item.totalPrice;
							   nVendas++;
							   sNodeText = aNodes[nIndex].data.month;
							   aNodes[nIndex].text = sNodeText + " V: " + nVendas + " Qtde: " + nQtdVendas + " Total: " + oFloatFormat.format(nTotalVendas) + " BRL"
							 }		
					}
				});
			}
  		   else if (iLevel == 1){
					const aDayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
					aVendasGeral.forEach((item,index) =>{
						if (jsoKey.year == item.orderYear.toString()) {
						 if (jsoKey.month == item.orderDate.toLocaleString('default', { month: 'long' })) {
						  let nDay = item.orderDate.getDay();
						  aNodes.push({
									   text: item.orderDate.getDate()+"/"+aDayNames[nDay],
									   data: {"year":item.orderYear,"month":sAtualMonth},
									   nodes: [{ // This dummy node is required to get an expandable item.
										text: "fim",
										dummy: false
									   }
									  ]

									  });				 
								}
						   }
					});
				}

				oModel.setProperty(sPath ? sPath + "/nodes" : "/", aNodes);
				oTree.setBusy(false);
			}, 2000);
		}
	});
});
