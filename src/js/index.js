import './lib/jquery-ui-1.12.1/jquery-ui.js'
import './jtopo0.4.8.js'
import './symbols.js'
import './JTopoExt.js'


import {MyEditor} from './myeditor.js'
var global_editor = null;
$(document).ready(function() {

    global_editor = new MyEditor("workArea",JTopo);

});

