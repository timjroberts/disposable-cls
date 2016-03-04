"use strict";

import * as path from "path";

require("blanket")({ pattern: path.join(__dirname, "..", "src") });
