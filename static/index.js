import './lib/jquery-ui-1.12.1/jquery-ui.js'

import './JTopoExt.js'


import {MyEditor} from './myeditor.js'

$(document).ready(function() {

    JTopo.editor = new MyEditor("workArea",JTopo);

});

