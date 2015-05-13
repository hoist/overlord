'use strict';
var Fleetctl = require("fleetctl");
var fleetctl = new Fleetctl();
fleetctl.submit(["something"],function(err, machines){
    if(err){
        throw err;
      }

    console.log(machines);
});
