require('jquery-ui-bundle');

import './JTopoExt.js'


import {MyEditor} from './myeditor.js'

$(document).ready(function() {

    JTopo.editor = new MyEditor("workArea",JTopo);

});

