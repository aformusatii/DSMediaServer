const modelist = ace.require("ace/ext/modelist");
ace.require("ace/ext/language_tools");

THEAPP.component('codeEditor', {
    templateUrl: 'js/components/code-editor/code-editor.html',
    bindings: {
        onLoad: '<',
        onSave: '<'
    },
    controller: function($element, $http, $scope) {
        let editor = null;
        let $editor = null;

        const resizeEditor = function() {
            const windowsHeight = $(window.top).height();
            const menuHeight = $('#content ul').height();

            $editor.height(windowsHeight - menuHeight - 60);
            editor.resize();
        }

        this.$onInit = function() {
            const $this = this;

            $editor = $element.find('.editor');
            editor = ace.edit($editor.get(0));

            editor.setTheme("ace/theme/tomorrow_night");
            editor.session.setMode("ace/mode/yaml");

            // https://ace.c9.io/build/kitchen-sink.html
            editor.setTheme("ace/theme/vibrant_ink");
            editor.setFontSize("14px");

            const mode = modelist.getModeForPath('.yaml').mode;
            editor.session.setMode(mode);

            editor.getSession().setUseWrapMode(true);
            //editor.getSession().on('change', detectChanges);

            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,
                tabSize: 2,
                useSoftTabs: false
            });

            resizeEditor();

            window.addEventListener('resize', resizeEditor, false);

            $this.onLoad(function(content) {
                editor.setValue(content);
                editor.gotoLine(1);
                resizeEditor();
            });

            $scope.saveChanges = function() {
                $this.onSave(editor.getValue());
            }
        }

        this.$onDestroy = function() {
            window.removeEventListener('resize', resizeEditor, false);
            editor.destroy();
        }
    }
});