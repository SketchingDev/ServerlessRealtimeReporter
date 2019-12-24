import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import * as React from "react";
import { Header, Icon, Table } from "semantic-ui-react";
import { Process } from "./@types/process";
import { getProcessQuery } from "./graphql/queries";
import { ListTasks } from "./ListTasks";

interface IProps {
  match: {
    params: {
      processId: string;
    };
  };
}

export class ProcessDetails extends React.Component<IProps, {}> {
  private readonly processId: string;

  constructor(props: IProps) {
    super(props);
    this.processId = props.match.params.processId;
  }

  public render() {
    const ProcessInfo = ({ process }: { process: Process }) => (
      <Table celled={true}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Field</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Date started</Table.Cell>
            <Table.Cell>{new Date(process.created).toISOString()}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    return (
      <Connect query={graphqlOperation(getProcessQuery, { id: this.processId })}>
        {({ data: { getProcess }, loading, errors }: { data: { getProcess: Process }; loading: any; errors: any }) => {
          if (errors && errors.length > 0) {
            console.log(errors);
            return <h3>Error</h3>;
          }
          if (loading || !getProcess) {
            return <h3>Loading...</h3>;
          }

          return (
            <div>
              <Header as="h2" icon={true} textAlign="center">
                <Icon name="file alternate outline" size="large" circular={true} />
                <Header.Content>
                  {getProcess.name}
                  <Header.Subheader>In Progress</Header.Subheader>
                </Header.Content>
              </Header>

              <ProcessInfo process={getProcess} />

              <Header as="h3">Invocations</Header>
              <ListTasks processId={this.processId} />
            </div>
          );
        }}
      </Connect>
    );
  }
}
