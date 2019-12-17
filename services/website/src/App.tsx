import * as React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { Container } from "semantic-ui-react";
import { ListProcesses } from "./ListProcesses";
import { ProcessDetails } from "./ProcessDetails";

export class App extends React.Component {
  public render() {
    return (
      <Container className={"App"}>
        <HashRouter>
          <Switch>
            <Route exact={true} path="/" component={ListProcesses} />
            <Route path="/process/:processId" component={ProcessDetails} />
          </Switch>
        </HashRouter>
      </Container>
    );
  }
}
