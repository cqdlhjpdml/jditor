import { MyDialog } from './ui-base.js'
import { CommonUtilities } from './common.js'
import{PropertyAction} from './undo-redo-action.js'
var Text_Node_Property_ConfigArray = [
    { propname: "borderColor", caption: "边框颜色", inputtype: "colorPicker", defaultValue: "100,0,0", dataType: typeof "str" },
    { propname: "borderWidth", caption: "边框线宽", inputtype: "select", items: [1, 2, 3, 4, 5, 6, 0], defaultValue: 1, dataType: typeof 10 },
    { propname: "borderRadius", caption: "圆角半径", inputtype: "select", items: [0, 1, 2, 3, 4, 5, 6], defaultValue: 3, dataType: typeof 10 },
    { propname: "fillColor", caption: "填充颜色", inputtype: "colorPicker", defaultValue: "255,255,255", dataType: typeof "str" },

    { propname: "text", caption: "文本内容", inputtype: "input", defaultValue: "新文本框", dataType: typeof "str" },
    { propname: "fontColor", caption: "文本颜色", inputtype: "colorPicker", defaultValue: "10,10,10", dataType: typeof "str" },
    { propname: "fontStyle", caption: "文本风格", inputtype: "select", items: ["Normal", "Italic"], defaultValue: "Normal", dataType: typeof "str" },
    { propname: "fontFamily", caption: "字体", inputtype: "select", items: ["宋体", "华文仿宋", "魏碑", "隶书", "微软雅黑", "serif"], defaultValue: "宋体", dataType: typeof "str" },
    { propname: "fontSize", caption: "字号", inputtype: "select", items: ["12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"], defaultValue: "16", dataType: typeof "str" }

];

var Svg_Node_Property_Config = [

    { propname: "text", caption: "文本内容", inputtype: "input", defaultValue: "", dataType: typeof "str" },
    { propname: "fontColor", caption: "文本颜色", inputtype: "colorPicker", defaultValue: "10,10,10", dataType: typeof "str" },
    { propname: "fontStyle", caption: "文本风格", inputtype: "select", items: ["Normal", "Italic"], defaultValue: "Normal", dataType: typeof "str" },
    { propname: "fontFamily", caption: "字体", inputtype: "select", items: ["宋体", "华文仿宋", "魏碑", "隶书", "微软雅黑", "serif"], defaultValue: "宋体", dataType: typeof "str" },
    { propname: "fontSize", caption: "字号", inputtype: "select", items: ["12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"], defaultValue: "16", dataType: typeof "str" },
    {
        propname: "textPosition", caption: "文本位置", inputtype: "select", items: ["Top_Left", "Top_Center", "Top_Right", "Middle_Left", "Middle_Right", "Middle_Center",
            "Bottom_Left", "Bottom_Center", "Bottom_Right"], defaultValue: "Bottom_Center", dataType: typeof "str"
    }
];



//////////////////////////////////
class PropPanel extends MyDialog {
    constructor(title) {
        super(title);
        this.element = null;
        this.properties = new Array();

    }
    //overridae
    jqDialog() {
        var me = this;
        $(`#${this.id}`).dialog({
            close: false,
            autoOpen: false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
                "Apply": {
                    text: "应用",

                    click: function () {
                        me.apply();
                    }
                },

                "Cancel": {
                    text: "退出",
                    click: function () {
                        $(`#${this.id}`).dialog("close");

                    },
                }
            }
        });

        $(`#${this.id}`).on("dialogopen", function () {
            me.propertiesInitialize();
        });


    }
    customPropertiesInitialize() { }
    propertiesInitialize() {

        for (let i = 0; i < this.properties.length; i++) {
            let control = this.properties[i].control();
            control[0].value = this.element.getPropertyValue(this.properties[i].propertyname);
            if (this.properties[i].inputtype == "colorPicker") {
                control.ready(function () {

                    control.colorpicker({
                        showOn: "button"
                    })

                });
            }

        }
        this.customPropertiesInitialize();
    }
    setElement(element) {
        this.element = element;
    }
    customApply() { }
    apply() {
        var args={};
        args.obj=this.element;
        args.props={};
        for (let i = 0; i < this.properties.length; i++) {
            let value = this.properties[i].val();
            if (this.properties[i].dataType == typeof 10)    value = parseInt(value);
            args.props[this.properties[i].propertyname]=this.element.getPropertyValue(this.properties[i].propertyname);
            this.element.setPropertyValue(this.properties[i].propertyname, value);
            
        }
        var propAction=new PropertyAction(args);
        var actionManager=this.element.scene.getEditor().toolManager.actionManager;
        actionManager.pushUndoAction(propAction);
        this.customApply();

    }
    //override
    contentBar() {
        this.jqContentBarID = CommonUtilities.getGuid();
        this.jqContentBar = $(`<div id=${this.jqContentBarID}></div>`);
        this.jqContentBar.css({
            "font-family": "宋体", "display": "grid", "min-width": "200px",
            "grid-template-columns": "35% 65% ",
            "grid-row-gap": "8px",
            "grid-column-gap": "8px"
        });
        var jqLabel;

        for (let i = 0; i < this.propConfig.length; i++) {
            let config = this.propConfig[i];
            switch (config.inputtype) {
                case "select":
                    var selectListID = CommonUtilities.getGuid();
                    var jqSelectList = $(`<select id=${selectListID}></select>`).css({ "width": "100px" });;;
                    jqLabel = $(`<lable for=${selectListID}>${config.caption}</label>`);
                    this.jqContentBar.append(jqLabel);
                    for (let j = 0; j < config.items.length; j++) {
                        let optionvalue = config.items[j];
                        let option = $(`<option>${optionvalue}</option>`)
                        jqSelectList.append(option);
                    }
                    this.jqContentBar.append(jqSelectList);
                    var property = {
                        propertyname: config.propname,
                        control: function () { var t = jqSelectList; return function () { return t } }(),
                        val: function () {
                            var t = jqSelectList;
                            return function () { return t[0].selectedOptions[0].value; }
                        }(),
                        dataType: config.dataType,
                        inputtype: config.inputtype
                    }
                    this.properties.push(property);
                    break;
                case "input":
                    var inputBoxID = CommonUtilities.getGuid();
                    var jqInputBox = $(`<input id=${inputBoxID}></input>`).css({ "width": "100px" });;;
                    jqLabel = $(`<lable for=${inputBoxID}>${config.caption}</label>`);
                    this.jqContentBar.append(jqLabel);
                    this.jqContentBar.append(jqInputBox);
                    var property = {
                        propertyname: config.propname,
                        control: function () { var t = jqInputBox; return t; },
                        val: function () {
                            var t = jqInputBox;
                            return function () { return t[0].value; }
                        }(),
                        dataType: config.dataType,
                        inputtype: config.inputtype
                    }
                    this.properties.push(property);
                    break;
                case "colorPicker":
                    function f(self) {
                        var inputBoxID = CommonUtilities.getGuid();
                        var jqInputBox = $(`<input id=${inputBoxID}></input>`).css({ "width": "100px" });;

                        jqLabel = $(`<lable for=${inputBoxID}>${config.caption}</label>`);
                        self.jqContentBar.append(jqLabel);
                        self.jqContentBar.append(jqInputBox);


                        var property = {
                            propertyname: config.propname,
                            control: function () { var t = jqInputBox; return t; },
                            val: function () {
                                var t = jqInputBox;
                                return function () {
                                    var RGB = t.colorpicker("val");


                                    return RGB;
                                }
                            }(),
                            dataType: config.dataType,
                            inputtype: config.inputtype

                        }

                        self.properties.push(property);
                    }

                    f(this);


                    break;
                default:
                    break;

            }

        }

        return this.jqContentBar;
    }
}

///////////////////////////////
class SvgNodePropPanel extends PropPanel {
    constructor(title) {
        super(title);
        this.propConfig = Svg_Node_Property_Config;
        this.create();
    }
    customApply() {

    }



}
//////////////////////////////////
class TextNodePropPanel extends PropPanel {
    constructor(title) {
        super(title);
        this.propConfig = Text_Node_Property_ConfigArray;
        this.create();
    }
    customApply() {
        this.element.caculateTextSize();


    }


}

//////////////
class PropPanelFactory {
    static getPropPanelInstance(title, element) {
        if (!this.panels) this.panels = new Array();
        if (this.panels[element.elementType]) {
            this.panels[element.elementType].element = element;
            return this.panels[element.elementType];
        }
        switch (element.elementType) {
            case "TextNode":
                var panel = new TextNodePropPanel(title);
                break;
            case "SvgNode":
                var panel = new SvgNodePropPanel(title); break;

        }
        panel.element = element;
        this.panels[element.elementType] = panel;
        return panel;

    }

}
//////////////////////////////////////////////////////////
export { PropPanelFactory, Svg_Node_Property_Config, Text_Node_Property_ConfigArray }