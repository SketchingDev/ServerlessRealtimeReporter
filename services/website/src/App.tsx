import * as React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { Container } from "semantic-ui-react";
import { ListSources } from "./ListSources";

export class App extends React.Component {
  public render() {
    return (
      <Container className={"App"}>
        <HashRouter>
          <Switch>
            <Route exact={true} path="/" component={ListSources} />
          </Switch>
        </HashRouter>
      </Container>
    );
  }
}
