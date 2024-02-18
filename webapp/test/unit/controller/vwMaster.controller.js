/*global QUnit*/

sap.ui.define([
	"comlhccustodioprojetossapbas/nw/controller/vwMaster.controller"
], function (Controller) {
	"use strict";

	QUnit.module("vwMaster Controller");

	QUnit.test("I should test the vwMaster controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
