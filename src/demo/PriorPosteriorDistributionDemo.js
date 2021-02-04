/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { Component } from "react";
import PriorPosteriorDistribution from "../lib/components/PriorPosteriorDistribution";

const data = require("./example-data/prior-posterior.json");

class PriorPosteriorDistributionDemo extends Component {
    render() {
        return <PriorPosteriorDistribution id="someid" data={data} />;
    }
}

export default PriorPosteriorDistributionDemo;
