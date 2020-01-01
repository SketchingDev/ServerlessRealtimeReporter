import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { distanceInWords } from "date-fns";
import * as React from "react";
import { Link } from "react-router-dom";
import { Header, Icon, List } from "semantic-ui-react";
import { Process } from "./@types/process";
import { getAllProcessesQuery } from "./graphql/queries";
import { onCreateProcessSubscription } from "./graphql/subscriptions";

export class ListProcesses extends React.Component {
  private createdProcesses: { [processId: string]: Process } = {};

  public render() {
    const ProcessItem = ({ process }: { process: Process }) => (
      <List.Item key={process.id}>
        <List.Icon name="github" size="large" verticalAlign="middle" />
        <List.Content>
          <List.Header>
            <Link to={`/process/${process.id}`}>{process.name}</Link>
          </List.Header>
          <List.Description as="a">{distanceInWords(Date.now(), new Date(process.created))}</List.Description>
        </List.Content>
      </List.Item>
    );

    const ProcessList = ({ processes }: { processes: Process[] }) => (
      <List divided={true} relaxed={true}>
        {processes
          .sort((s1, s2) => s2.created - s1.created)
          .map(process => (
            <ProcessItem key={process.id} process={process} />
          ))}
      </List>
    );

    const subscriptionMsg = (prev: { listProcesses: Process[] }, { onCreateProcess }: { onCreateProcess: Process }) => {
      this.createdProcesses[onCreateProcess.id] = onCreateProcess;
      return prev;
    };

    return (
      <Connect
        query={graphqlOperation(getAllProcessesQuery)}
        subscription={graphqlOperation(onCreateProcessSubscription)}
        onSubscriptionMsg={subscriptionMsg}
      >
        {({ data, loading, errors }: { data: { getAllProcesses: Process[] }; loading: any; errors: Error[] }) => {
          if (errors && errors.length > 0) {
            return (
              <div>
                <h3>Error...</h3>
                {errors.map(eb => (
                  <p key="{eb.message}">{eb.message}</p>
                ))}
              </div>
            );
          }
          if (loading || !data.getAllProcesses) {
            return <h3>Loading...</h3>;
          }

          const allProcesses = Object.values(this.createdProcesses).concat(data.getAllProcesses);
          const orderedProcesses = allProcesses.sort((s1: Process, s2: Process) => s1.created - s2.created);

          return (
            <div>
              <Header as="h2">
                <Icon name="folder open outline" />
                <Header.Content>
                  Processes
                  <Header.Subheader>View all processes</Header.Subheader>
                </Header.Content>
              </Header>
              <ProcessList processes={orderedProcesses} />
            </div>
          );
        }}
      </Connect>
    );
  }
}
