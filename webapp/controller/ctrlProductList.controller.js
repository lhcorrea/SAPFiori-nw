sap.ui.define([
	'sap/ui/core/Core',
	'sap/ui/core/mvc/Controller',
	'sap/ui/Device',
	'sap/ui/model/Filter',
	'sap/ui/model/Sorter',
	'sap/m/Menu',
	'sap/m/MenuItem',	
	'sap/ui/core/Fragment',		
	"sap/f/library",
	"sap/m/ViewSettingsFilterItem",
	"sap/m/ViewSettingsItem",	
	"sap/m/Dialog",
	"sap/m/MessageBox",
	'sap/m/MessageToast',
	'sap/ui/core/Icon',			

], function(Core,Controller, Device , Filter, Sorter, Menu, MenuItem, 
	        Fragment, fioriLibrary, ViewSettingsFilterItem, ViewSettingsItem, 
			Dialog, MessageBox, MessageToast) {
"use strict";

return Controller.extend("com.lhccustodio.projetos.sapbas.odata.nw.controller.ctrlProductList", {
		onInit: function () {
			this.that = this;
			this.oView = this.getView();
			this._bDescendingSort = false;			
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oTabelaProdutos = this.oView.byId("productsTable");
			this.oProductItem = null;
			let oComboCategoria = this.oView.byId("cbxCategorias");
			let oComboFornecedor = this.oView.byId("cbxFornecedores");
			
			this.aFields = [
				            {
							 "fieldIndex":0,
							 "fieldSettings":{"visible":true,"sorted":false,"filtered":false,"grouped":false}, 							 
							 "column": {"type": sap.m.Image, 
							            "Properties": ["src"]},
							 "fieldHeader": "",
							 "fieldName":"",
							 "fieldValue": "https://sapui5.hana.ondemand.com/resources/sap/ui/documentation/sdk/images/logo_ui5.png",
							 "filterValues":[]
							},
				            {
						 	 "fieldIndex":1,
							 "fieldSettings":{"visible":false,"sorted":true,"filtered":false,"grouped":false},
							 "column": {"type": sap.m.Text, 
							            "Properties": ["text"]},
							 "fieldHeader": "Código",
							 "fieldName":"ProductID",
							 "filterValues":[]
							},
			                {
							 "fieldIndex":2,
							 "fieldSettings":{"visible":true,"sorted":true,"filtered":true,"grouped":false},							 
							 "column": {"type": sap.m.ObjectIdentifier, 
							 			"Properties": ["title"]},
							 "columnProp": "title",
							 "fieldHeader": "Produto",
							 "fieldName":"ProductName",
							 "filterValues":[]
							},
							{
							 "fieldIndex":3,
							 "fieldSettings":{"visible":true,"sorted":true,"filtered":true,"grouped":true},
							 "column": {"type": sap.m.Text, 
							            "Properties": ["text"]},
							 "fieldHeader": "Categoria",
							 "fieldName":"Category/CategoryName",
							 "fieldKey":"SupplierID",	
							 "filterValues":[]
							},
			                {
							 "fieldIndex":4,
							 "fieldSettings":{"visible":true,"sorted":true,"filtered":true,"grouped":true},
							 "column": {"type": sap.m.Text, 
							            "Properties": ["text"]},
							 "fieldHeader": "Fornecedor",
							 "fieldName":"Supplier/CompanyName",							 
							 "fieldKey":"CategoryID",
							 "filterValues":[]
							},
							{
							 "fieldIndex":5,
							 "fieldSettings":{"visible":false,"sorted":false,"filtered":false,"grouped":false},
							 "column": {"type": sap.m.Text, 
							            "Properties": ["text"]},
							 "fieldHeader": "Estoque",
							 "fieldName":"UnitsInStock",							 
							 "filterValues":[]
							},
							{
						 	 "fieldIndex":6,
							 "fieldSettings":{"visible":false,"sorted":false,"filtered":false,"grouped":false},
							 "column": {"type": sap.m.Text, 
							            "Properties": ["text"]},
							 "fieldHeader": 
							 "Preço","fieldName":
							 "NorthWind>UnitPrice",
							 "filterValues":[]
							},											
						   ];

			this.filterSettings = [{"columnIndex":3,"columnFieldName":"Category/CategoryName", "values":[]},
			                       {"columnIndex":4,"columnFieldName":"Supplier/CompanyName","values":[]}];
			this.sortSettings = [{"columnIndex":1,"columnHeader": "Código","columnFieldName":"ProductID"},
			                     {"columnIndex":1,"columnHeader": "Código","columnFieldName":"ProductID"},
			                     {"columnIndex":4,"columnFieldName":"Supplier/CompanyName","values":[]}];


			console.log("ctrlProductList.js [onInit]: oRouter ->",this.oRouter);    
			sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");
			
			let aColumn = [
				new sap.m.Column({
					width:"8rem",
					header: new sap.m.Label({						
						text: "",						
					})
				}),
				new sap.m.Column({
					visible: false,
					headerMenu:"columnHeaderMenu",
					header: new sap.m.Label({
						text: "Código",
						design: "Bold"
					})
				}),
				new sap.m.Column({
					width:"8rem",
					header: new sap.m.Label({
						text: "Produto",						
					})
				}),
				new sap.m.Column({
					width:"8rem",
					header: new sap.m.Label({
						text: "Categoria"						
					})
				}),
				new sap.m.Column({
					width:"10rem",
					header: new sap.m.Label({
						text: "Fornecedor"
					})
				}),
				/*
				new sap.m.Column({
					header: new sap.m.Label({
						width:"4rem",
						text: "Estoque",
						textAlign:"Right"
					})
				}),
				new sap.m.Column({
					width:"5rem",
					header: new sap.m.Label({
						text: "Preço",
						hAlign:"End"
					})
				}),	
				new sap.m.Column({
					header: new sap.m.Label({
						text: "Vendas",
						design: "Bold",
						hAlign:"End"
					})
				}),*/
				new sap.m.Column({
					header: new sap.m.Label({
						text: "Ativo ?",
						design: "Bold"
					})
				}),						
				new sap.m.Column({
					width: "auto"
				}),
				new sap.m.Column({
					width: "auto"
				}),
			].forEach((element) => this.oTabelaProdutos.addColumn(element));

			var oTemplate = new sap.m.ColumnListItem({	
				type:"Navigation",
				press:[this.onListItemPress,this],
				cells: [
					new sap.m.Image({
						   src:{parts:['NorthWind>Category/Picture'],
						        formatter:'encodeImage'
					}}),
					new sap.m.Text({						
						text: "{NorthWind>ProductID}"
					}),
					new sap.m.ObjectIdentifier({
						title:"{NorthWind>ProductName}", text:"{NorthWind>ProductID}"
					}),
					new sap.m.Text({						
						text: "{NorthWind>Category/CategoryName}"
					}),
					new sap.m.Text({
						text: "{NorthWind>Supplier/CompanyName}"
					}),/*
					new sap.m.Label({
							text: '{NorthWind>UnitsInStock}',
							textAlign: "Right"
						}),					
					new sap.m.Label({
						text: {parts:[{path:'NorthWind>UnitPrice'},{path:'BRL'}],
					           type:'sap.ui.model.type.Currency',
					           formatOptions:{showMeasure: true, currencyCode: true}
							  },
						textAlign: "Right"
					}),
					new sap.m.Text({text:{parts:[{path:'0'}],
											type:'sap.ui.model.type.Integer',
											formatOptions:{groupingSeparator: "."}
										},textAlign: "Right"}),
					*/
					new sap.ui.core.Icon({src:"{=${NorthWind>Discontinued} === false ? 'sap-icon://accept' : 'sap-icon://decline'}"}),					
					
					new sap.m.Button({
						//text:"delete",
						icon: "sap-icon://edit",
						type: "Accept",
						press: [ this.onShowEditDialog, this ],
						}),
					new sap.m.Button({
						//text:"delete",
						icon: "sap-icon://delete",
						type: "Reject",
						press: [ this.onButtonDelete ]						
					})
				]
			});
			
			var oModel = this.getOwnerComponent().getModel("NorthWind");
			this.getView().setModel(oModel);
			//Expand
			/* Código para o futuro
			var jsonModel = new sap.ui.model.json.JSONModel();

			var oProductsData = this.testePromiseOData();
			oProductsData.then(function(data) {				
				this.jsonModel = new sap.ui.model.json.JSONModel({'Products':data.results});

				//this.getView().setModel(jsonModel,'teste');					
			}.bind(this)).catch(function(oError) {
				// erro
			}.bind(this));
			*/

			
			this.oTabelaProdutos.bindAggregation("items", {
				path: "/Products",				
				model: "NorthWind",
				parameters: {expand: "Category,Supplier",inlinecount:"allpages"},				
				template: oTemplate				
			});
			
			//this.countCustomersInAXXX();

			// Mantem referência a qualquer um dos sap.m.ViewSettingsDialog-s
			this._mDialogs = {};

			var oCategoriaItemTemplate = new sap.ui.core.ListItem({text:"{NorthWind>CategoryName}"});

			oComboCategoria.bindAggregation("items", {
				path: "/Categories",				
				model: "NorthWind",
				template: oCategoriaItemTemplate
			});

			var oFornecedorItemTemplate = new sap.ui.core.ListItem({text:"{NorthWind>CompanyName}"});

			oComboFornecedor.bindAggregation("items", {
				path: "/Suppliers",				
				model: "NorthWind",
				template: oFornecedorItemTemplate
			});

			this.oTabelaProdutos.addEventDelegate({
				onAfterRendering: function () {									
					var aItems = this.oTabelaProdutos.getItems();						
					if (aItems.length) 
					 {
						let aBindingItems = this.oTabelaProdutos.getBinding("items");							
						this.aFields.forEach(function (field, i) {
							if (field.fieldSettings.filtered){
							 aItems.forEach((item,p)=>{
								let oJSONProduto = JSON.parse(aBindingItems.aLastContextData[p]);
								item.data = oJSONProduto;								
								let sKey = oJSONProduto[field.fieldKey];
								let aParts = field.fieldName.split("/");
								let sValor;
								switch (aParts.length) {
									case 1: sValor = oJSONProduto[aParts[0]]; break;
									case 2: sValor = oJSONProduto[aParts[0]][aParts[1]]; break;
									case 3: sValor = oJSONProduto[0][1][2]; break;
								}														
								//let sValor = item.getCells()[i].getProperty(field.column.Properties[0]);
								const itemExists = (arr,value) => {
								  return arr.some((aItem) => aItem.value === value);
								}
								if (!itemExists(field.filterValues, sValor)) {
									field.filterValues.push({"key":sKey,"value":sValor});
								}
							});
						}},this);

						aItems.forEach((item,p)=>{
							// Pega todas as Orders_Details do produto		
							let sImagem = this.encodeImage(item.getCells()[0].mProperties.src);
							item.getCells()[0].setProperty('src',sImagem);
							let sProdutoID = item.getCells()[1].mProperties.text
							//	item.getCells()[7].setProperty('text',"&#xe0e0");							
						});
					 }
					//console.log("ctrlProductList.js: [onUpdateFinished] filterValues[0] ->",this.filterValues[0]);
				}
			},this);		
		},		
        testePromiseOData: function(){
			console.log(this);
			return new Promise(function (resolve, reject) {
				this.getView().getModel().read("/Products", {					
					urlParameters: {
						$expand: "Category,Supplier",
						$top:100,
						$skip:0						
					},
					success: function (oData) 
					 { 
					   resolve(oData);
					 },
					error: function(oError)
					 { reject(oError);} 
			});
		}.bind(this))},
        onAfterRendering: function() {
			var that = this;
			var oTable = this.getView().byId("productsTable");
			var oText =  this.getView().byId("lblProductsCount");
			var oItems = oTable.getBinding("items");
			oText.setText("Buscando produtos");
			//Check items Binding change
			oItems.attachChange(function(oEvent) {
			  oText.setText("Buscando produtos");
			  var oLength = oEvent.getSource().iLength;			  
			  let sPlural = (oLength==1?"":"s");  
			  oText.setText(oLength + " Produto" + sPlural + " encontrado" + sPlural);
			},this)
		  },
  
		onUpdateFinished: function(oEvent) { },
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query"),
				oBinding = this.oTabelaProdutos.getBinding("items");

			if (sQuery && sQuery.length > 0) {				
				oTableSearchState = new Filter("ProductName", sap.ui.model.FilterOperator.Contains, sQuery);
			}

			oBinding.filter(oTableSearchState,"Application");
		},

		onAdd: function () {
			MessageBox.information("This functionality is not ready yet.", {title: "Aw, Snap!"});
		},

		onSort: function () {
			this._bDescendingSort = !this._bDescendingSort;
			var oBinding = this.oTabelaProdutos.getBinding("items"),
				oSorter = new Sorter("Name", this._bDescendingSort);

			oBinding.sort(oSorter);
		},

		onListItemPress: function (oEvent) {
			var product = oEvent.getSource().getCells()[1].getProperty('text');
			
			//console.log("ctrlProductList.js: [onListItemPress] productPath ->",productPath);    
			//console.log("ctrlProductList.js: [onListItemPress] product ->",product);    
			//console.log("ctrlProductList.js [onListItemPress]: oRouter1 ->",this.oRouter);    
									
			// Passa o Layout a ser utilizado e o código produto a ser mostrado			
			this.oRouter.navTo("detail",{layout: fioriLibrary.LayoutType.TwoColumnsBeginExpanded,product: product},true);
		},

		countCustomersInAXXX : function (oEvent) {
			var suffix = 'Products/$count';
			var oDataServiceUrl = localStorage.getItem('oDataServiceUrl');
			var oDataServiceUri = oDataServiceUrl.concat(suffix);
			console.log('App.controller.js: oDataServiceUri', oDataServiceUri);
			var count = $.ajax({type: "GET", url: oDataServiceUri, async: false}).responseText;
			console.log('App.controller.js: countCustomersInAXXX:' , count);
			//this.getView().byId("titleId").setText(count);
		},
		resetGroupDialog: function(oEvent) {
			this.groupReset =  true;
		},
		getViewSettingsDialog: function (sDialogFragmentName) {
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},
		handleSortButtonPressed: function () {
			this._openDialog("Dialog", "sort", this._presetSettingsItems,"scale-in-center");
		},

		handleFilterButtonPressed: function () {
			this._openDialog("Dialog", "filter", this._presetSettingsItems);
		},

		handleGroupButtonPressed: function () {
			this._openDialog("Dialog", "group", this._presetSettingsItems,"scale-in-center");
		},

		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.oTabelaProdutos,
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		handleFilterDialogConfirm: function (oEvent) {
			var oTable = this.oTabelaProdutos,
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];

			mParams.filterItems.forEach(function(oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = aSplit[3],
					oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		},

		handleGroupDialogConfirm: function (oEvent) {
			var oTable = this.oTabelaProdutos,
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];

			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				// apply the selected group settings
				oBinding.sort(aGroups);
			} else if (this.groupReset) {
				oBinding.sort();
				this.groupReset = false;
			}
		},
		onToggleContextMenu: function (oEvent) {
			var oToggleButton = oEvent.getSource();
			if (oEvent.getParameter("pressed")) {
				oToggleButton.setTooltip("Disable Custom Context Menu");
				this.oTabelaProdutos.setContextMenu(new Menu({
					items: [
						new MenuItem({text: "{NorthWind>ProductName}"}),
						new MenuItem({text: "{NorthWind>Category/CategoryName}"})
					]
				}));
			} else {
				oToggleButton.setTooltip("Enable Custom Context Menu");
				this.oTabelaProdutos.destroyContextMenu();
			}
		},
		/*
		{ "defPage": "",
		  "inCSS": "",
		  "rstCSS": "",
		  "funInit": _onInitDialogEdit,
		  "funLoad": _onLoadDataDialogEdit,
	    }
		*/

		_openDialog: function(sDialogName, jsoParams) {
			let oView = this.getView(),
				oThis = this;
		
			// creates requested dialog if not yet created
			//oView.setBusy(true);
			if (!this._mDialogs[sDialogName]) {
				this._mDialogs[sDialogName] = Fragment.load({
					id: oView.getId(),
					name: "com.lhccustodio.projetos.sapbas.odata.nw.fragment." + sDialogName,
					controller: this.that
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					if (jsoParams.funInit) {
						jsoParams.funInit(oDialog, oThis);
					}
					return oDialog;
				});
			}
			this._mDialogs[sDialogName].then(function(oDialog) {	
			   // Necessario remover Animação CSS adicionadas	
               oDialog.removeStyleClass("rotate-out-diag-2");
			   oDialog.removeStyleClass("rotate-out-hor");			   
			   oDialog.removeStyleClass("roll-out-right");
			   oDialog.removeStyleClass("scale-in-center");
			   oDialog.removeStyleClass("DialogHighlighted");
               if (jsoParams.inCSS) {
				oDialog.addStyleClass("sapThemeBaseBG-asBackgroundColor DialogHighlighted");
				oDialog.addStyleClass(jsoParams.inCSS);
			   }

			   if (jsoParams.funLoad) {
				jsoParams.funLoad(oDialog, oThis);
			   }

			   oDialog.open(jsoParams.defPage); // opens the requested dialog page
			   // JQuery manual animation
			   //oDialog.$().offset({top:"-100", left: "50%"});	
			   oView.setBusy(false);
			});
		},
        // Executada apenas 1 vez ao instanciar o Dialog
		_presetSettingsItems: function (oDialog, oThis) {
			oThis._presetFiltersInit(oDialog, oThis);
			oThis._presetSortsInit(oDialog, oThis);
			oThis._presetGroupsInit(oDialog, oThis);
		},
		_presetFiltersInit: function(oDialog, oThis) {
			// Loop every column of the table
			oThis.aFields.forEach((field,index) => {				
				if (field.fieldSettings.filtered)
				 {
				   let columnId = field.fieldName,
				       oUniqueFilterItems = field.filterValues.map(oItem => new ViewSettingsItem({ // Convert unique values into ViewSettingsItem objects.
					   		text: oItem.value,
							key: columnId + "___" + "EQ___" + oItem.value // JSON property = Unique value
						}));
				    // Set this values as selectable on the filter list
					oDialog.addFilterItem(new ViewSettingsFilterItem({
						key: columnId, // ID of the column && JSON property
						text: field.fieldHeader,
						items: oUniqueFilterItems // Set of possible values of the filter
					}));
				}
			})
		},
		_presetSortsInit: function (oDialog, oThis) {			
			oThis.aFields.forEach(field => {								
				if (field.fieldSettings.sorted)					
						oDialog.addSortItem(new ViewSettingsItem({ // Convert column ID into ViewSettingsItem objects.
							key: field.fieldName, // Key -> JSON Property
							text: field.fieldHeader
						}));							  
			})
		},		
		// adds presetGroups to the View Settings Dialog
		_presetGroupsInit: function (oDialog, oThis) {			
			this.mGroupFunctions = {};
			oThis.aFields.forEach(field => {								
				if (field.fieldSettings.grouped)
					oDialog.addGroupItem(new ViewSettingsItem({ 
						key: field.fieldName, 
						text: field.fieldHeader
					}));			
			// Set group functions
			let groupFn = function (oContext) {
				//var name = oContext.getProperty(columnId);
				return {
					key: field.fieldName, // ID of the column && JSON property
					text: field.fieldHeader // Filter Name -> Column Text
				};
			}
			this.mGroupFunctions[field.fieldName] = {};
			this.mGroupFunctions[field.fieldName] = groupFn;
			});
		},
		handleConfirm: function (oEvent) {
			let oTable = this.byId("productsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [],
				sPath,
				bDescending,
				aSorters = [],
				vGroup,
				aGroups = [];

			// Filtering
			if (mParams.filterItems) {
				mParams.filterItems.forEach(function (oItem) {
					let aSplit = oItem.getKey().split("___"),
						sPath = aSplit[0],
						sOperator = aSplit[1],
						sValue1 = aSplit[2],
						sValue2 = aSplit[3],
						oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
					aFilters.push(oFilter);
				});
				// apply filter settings
				oBinding.filter(aFilters);
				// update filter bar
				//this.byId("suppliersFilterBar").setVisible(aFilters.length > 0);
				//this.byId("suppliersFilterLabel").setText(mParams.filterString);
			}
			// Sorting
			if (mParams.sortItem) {
				sPath = mParams.sortItem.getKey();
				bDescending = mParams.sortDescending;
				aSorters.push(new Sorter(sPath, bDescending));

				// apply the selected sort and group settings
				oBinding.sort(aSorters);
			}
			// Grouping
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				// apply the selected group settings
				oBinding.sort(aGroups);
			} else if (this.groupReset) {
				oBinding.sort();
				this.groupReset = false;
			}
		},
		onComboFilter: function(oEvent,cbxID) {
			if ( !this.oTabelaProdutos ) {
				return;
			}
			var comboBoxValue = this.byId(cbxID == "cat"?"cbxCategorias":"cbxFornecedores").getValue(),
				oBinding = this.oTabelaProdutos.getBinding("items"),
				oFilter;
			if (comboBoxValue || comboBoxValue === "") {
				this.oTabelaProdutos.setShowOverlay(false);
				if (cbxID == "cat")
				 oFilter = new Filter("Category/CategoryName", "EQ", comboBoxValue);
				else
				 oFilter = new Filter("Supplier/CompanyName", "EQ", comboBoxValue);
				oBinding.filter([oFilter],"Application");
			}
		},
		onReset: function(oEvent) {
			// resetting the value of Combobox and initial state of the table
			var oBinding = this.oTabelaProdutos.getBinding("items");
			oBinding.filter([],"Application");
			this.oTabelaProdutos.setShowOverlay(false);
			this.byId("cbxCategorias").setSelectedItem(null);
			this.byId("cbxFornecedores").setSelectedItem(null);
			this.byId("edtPesquisaProduto").setValue("");
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
		  getOwnerView: (oSource) => {
			while (oSource && oSource.getParent) {
				oSource = oSource.getParent();
				if (oSource instanceof sap.ui.core.mvc.View){								
					return oSource;					
				}
			}
		},
		onShowEditDialog: function(oEvent) {	
		 this.oProductItem = oEvent.getSource();
		 this._openDialog("EditDialog",{ "defPage": null,
		 								 "inCSS": "tilt-in-fwd-tl",
										 "rstCSS": null,
										 "funInit": null,
										 "funLoad": this._onLoadDataDialogEdit
										});
		},		
		// Executada sempre que o dialog é chamadado
		_onLoadDataDialogEdit: function (oDialog, oThis) {
			let oProduct = oThis.oProductItem.oParent.getCells();
			oThis.byId("edtProductName").setValue(oProduct[2].getTitle());
			let cbxCategorias = oThis.byId("cbxProductCategoria");
			cbxCategorias.destroyItems();
			let sSelectedItemID;
			let sCategoryName = oThis.oProductItem.oParent.data.Category.CategoryName;
			oThis.aFields[3].filterValues.forEach((item,i) => {
				let sItemID = "cbxCategorias_item"+i;
				if (item.value == sCategoryName) { sSelectedItemID = sItemID }
				cbxCategorias.addItem(new sap.ui.core.Item(sItemID,{
					key:item.key,
					text:item.value
					}));
			});
			
			cbxCategorias.setSelectedItemId(sSelectedItemID);

			let cbxFornecedores = oThis.byId("cbxProductFornecedor");
			let sSupplierName = oThis.oProductItem.oParent.data.Supplier.CompanyName;
			cbxFornecedores.destroyItems();
			oThis.aFields[4].filterValues.forEach((item,g) => {
				let sItemID = "cbxFornecedores_item"+g;
				if (item.value == sSupplierName) { sSelectedItemID = sItemID }
				cbxFornecedores.addItem(new sap.ui.core.Item(sItemID,{
					key:item.key,
					text:item.value
					}));
			});
			
			cbxFornecedores.setSelectedItemId(sSelectedItemID);
			let edtProductPreco = oThis.byId("edtProductPreco");
			edtProductPreco.setValue(parseFloat(oThis.oProductItem.oParent.data.UnitPrice));
			let edtProductEstoque = oThis.byId("edtProductEstoque");
			edtProductEstoque.setValue(parseInt(oThis.oProductItem.oParent.data.UnitsInStock));
			let edtProductQtdPorUnidade = oThis.byId("edtProductQtdPorUnidade");
			edtProductQtdPorUnidade.setValue(oThis.oProductItem.oParent.data.QuantityPerUnit);
			let edtProductDetails = oThis.byId("edtProductDetails");
			edtProductDetails.setValue("Caractristicas do produto =>" + oThis.oProductItem.oParent.data.ProductName + "\n\n" +
									   "Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy\n" +
			                           "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.");
		},		
		onDialogOK:(oEvent)=>{
			let oSource = oEvent.getSource();
			while (oSource && oSource.getParent) {
				oSource = oSource.getParent();
				if (oSource instanceof sap.ui.core.mvc.View){								
				 oSource.byId('editProductDialog').close();
				 break;
				}
			}
		},
		onDialogCancel:(oEvent)=>{			
			let oSource = oEvent.getSource();
			while (oSource && oSource.getParent) {
				oSource = oSource.getParent();
				if (oSource instanceof sap.ui.core.mvc.View){
				 let oDialog = oSource.byId('editProductDialog');
				 oDialog.removeStyleClass("tilt-in-fwd-tl");				 
				 //oDialog.addStyleClass("rotate-out-diag-2");
				 //oDialog.addStyleClass("rotate-out-hor");
				 oDialog.addStyleClass("roll-out-right");
				 oDialog.close();
				 break;
				}
			}
		},
		onEditProduct: function () {			
			/*
			if (!this.oEditDialog) {
				this.oEditDialog = new Dialog({
					title: "Available Products",
					class:"sapUiSmallMargin",
					content: [ new sap.m.Label({text:"LastName"}),
					           new sap.m.Input({maxLength: 20,id: "LName"}),
							   new sap.m.Label({text:"Age"}),
							   new sap.m.Input({maxLength: 3,id: "Age"})
				            ] ,
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oEditDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Close",
						press: function () {
							this.oEditDialog.close();
						}.bind(this)
					})
				});

				// to get access to the controller's model
				this.getView().addDependent(this.oEditDialog);
			}

			this.oEditDialog.open();*/
		},			
		onInputLiveChange: function (oEvent) {
			var oControl = oEvent.getSource();
			this.validateFloatInput(oControl);
		   },
		   onInputChange: function (oEvent) {
			var oControl = oEvent.getSource();
			this.validateFloatInput(oControl);
		   },
		   validateFloatInput: function (oControl) {
			var oBinding = oControl.getBinding("value");
			var oValue = oControl.getValue();
			try {
			 var oParsedValue = oBinding.getType().parseValue(oValue, oBinding.sInternalType); // throw error if cannot parse value
			 if (oParsedValue) {
			  oControl.setValueState(sap.ui.core.ValueState.None);
			 } else {
			  oControl.setValueState(sap.ui.core.ValueState.Error);
			 }
			} catch (ex) {
			 oControl.setValueState(sap.ui.core.ValueState.Error);
			}
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
 
	});	
});
