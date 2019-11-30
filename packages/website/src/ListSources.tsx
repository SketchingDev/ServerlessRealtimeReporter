import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { distanceInWords } from "date-fns";
import * as React from "react";

import { Link } from "react-router-dom";
import { Header, Icon, List } from "semantic-ui-react";
import { Source } from "./@types/source";
import { getAllSources as getAllSourcesQuery } from "./graphql/queries";
import { onCreateSource as onCreateSourceSub } from "./graphql/subscriptions";

export class ListSources extends React.Component {
  private createdSources: { [sourceId: string]: Source } = {};

  public render() {
    const SourceItem = ({ source }: { source: Source }) => (
      <List.Item key={source.id}>
        <List.Icon name="github" size="large" verticalAlign="middle" />
        <List.Content>
          <List.Header>
            <Link to={`/source/${source.id}`}>{source.name}</Link>
          </List.Header>
          <List.Description as="a">{distanceInWords(Date.now(), new Date(source.timestamp))}</List.Description>
        </List.Content>
      </List.Item>
    );

    const SourcesList = ({ sources }: { sources: Source[] }) => (
      <List divided={true} relaxed={true}>
        {sources
          .sort((s1, s2) => s2.timestamp - s1.timestamp)
          .map(source => (
            <SourceItem key={source.id} source={source} />
          ))}
      </List>
    );

    const subscriptionMsg = (prev: { listSources: Source[] }, { onCreateSource }: { onCreateSource: Source }) => {
      this.createdSources[onCreateSource.id] = onCreateSource;
      return prev;
    };

    return (
      <Connect
        query={graphqlOperation(getAllSourcesQuery)}
        subscription={graphqlOperation(onCreateSourceSub)}
        onSubscriptionMsg={subscriptionMsg}
      >
        {({
          data: { getAllSources },
          loading,
          errors,
        }: {
          data: { getAllSources: Source[] };
          loading: any;
          errors: any;
        }) => {
          if (errors && errors.length > 0) {
            return <h3>Error</h3>;
          }
          if (loading || !getAllSources) {
            return <h3>Loading...</h3>;
          }

          const allSources = Object.values(this.createdSources).concat(getAllSources);
          const orderedSources = allSources.sort((s1: Source, s2: Source) => s1.timestamp - s2.timestamp);

          return (
            <div>
              <Header as="h2">
                <Icon name="folder open outline" />
                <Header.Content>
                  Processes
                  <Header.Subheader>View all processes</Header.Subheader>
                </Header.Content>
              </Header>
              <SourcesList sources={orderedSources} />
            </div>
          );
        }}
      </Connect>
    );
  }
}
