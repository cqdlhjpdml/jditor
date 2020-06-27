import './lib/jquery-ui-1.12.1/jquery-ui.js'

import './JTopoExt.js'


import {MyEditor} from './myeditor.js'
var global_editor = null;
$(document).ready(function() {

    global_editor = new MyEditor("workArea",JTopo);

});

