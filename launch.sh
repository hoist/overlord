#!/bin/bash

fleetctl destroy overlord-web@.service
fleetctl destroy overlord-web@{1..3}.service
fleetctl start overlord-web@{1..3}.service
fleetctl destroy overlord-task@.service
fleetctl destroy overlord-task@{1..3}.service
fleetctl start overlord-task@{1..3}.service
