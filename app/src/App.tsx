import * as React from "react";
import {FileList} from "./components/FileList"
import {Navigation} from "./components/Navigation"
import {EditorPanel} from "./components/EditorPanel"


export const App = () => <div className="fn__flex">
    <Navigation></Navigation>
    <FileList></FileList>
    <EditorPanel></EditorPanel>
</div>;
