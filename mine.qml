/*
  =================================
  ==          mine.qml           ==
  ==    Minesweeper Interface    ==
  =================================
*/

import QtQuick 1.1
import "mine.js" as Script

Rectangle {
    width: Script.column * Script.size;
    height: Script.row * Script.size + status.height;
    Grid {
        columns: Script.column;
        rows: Script.row;
        anchors.centerIn: parent.Center;

        focus: true;
        Keys.onPressed: {
            if ((event.key == Qt.Key_N) && (event.modifiers & Qt.ControlModifier)) {        // Ctrl+N 重开一局
                repeater.acceptMouse = true;
                Script.init();
            }
        }

        Repeater {
            id: repeater
            model: parent.columns * parent.rows;

            property bool acceptMouse: true;

            Rectangle {
                width: Script.size;
                height: Script.size;

                border.width: 1;

                property string value: Script.emptyPic;

                Image {
                    source: parent.value;
                    anchors.fill: parent;
                }

                MouseArea {
                    anchors.fill: parent;
                    acceptedButtons: repeater.acceptMouse ? (Qt.LeftButton | Qt.RightButton) : 0;

                    onClicked: {
                        if (mouse.button == Qt.LeftButton) {
                            Script.clicked(index);
                        } else if (mouse.button == Qt.RightButton) {
                            Script.flag(index);
                        }
                    }

                    onDoubleClicked: {
                        Script.hint(index);
                    }
                }
            }
        }

        Timer {
            id: timer
            interval: 200;          // 毫秒
            running: false;
            repeat: false;
            onTriggered: Script.clearHint();
        }

    }

    Text {
        id: status
        x: 0
        y: 480
        width: Script.column * Script.size
        height: Script.statusBarHeight;
        text: "剩余雷数: "+Script.mineNum;
        font.family: "WenQuanYi Micro Hei"
        font.pixelSize: Script.statusBarHeight * 0.8;
    }
}
