import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import * as React from "react";
import { List, Progress } from "semantic-ui-react";
import { Process, Task } from "./@types/process";
import { getProcessTasksQuery } from "./graphql/queries";
import { onAddOrUpdateTaskSubscription } from "./graphql/subscriptions";

interface IProps {
  processId: string;
}

export class ListTasks extends React.Component<IProps> {
  public render() {
    const TaskItem = ({ task }: { task: Task }) => (
      <List.Item key={task.id}>
        <List.Content>
          <List.Header>{task.name || task.id}</List.Header>
          <List.Description>{task.status}</List.Description>
        </List.Content>
      </List.Item>
    );

    const ProcessTasks = ({ tasks }: { tasks: Task[] }) => (
      <List divided={true} relaxed={true}>
        {tasks
          .sort((i1, i2) => ("" + i1.status).localeCompare(i2.status))
          .map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
      </List>
    );

    return (
      <Connect
        query={graphqlOperation(getProcessTasksQuery, { id: this.props.processId })}
        subscription={graphqlOperation(onAddOrUpdateTaskSubscription)}
        onSubscriptionMsg={this.onAddedOrUpdatedTask}
      >
        {({ data, loading, errors }: { data: { getProcess: Process }; loading: any; errors: any }) => {
          console.log(data);
          const getProcess = data.getProcess;
          if (errors && errors.length > 0) {
            return <h3>Error</h3>;
          }
          if (loading || !getProcess) {
            return <h3>Loading...</h3>;
          }

          const tasks = getProcess.tasks.filter(i => i.processId === this.props.processId);
          const totalComplete = tasks.filter(i => i.status !== "PENDING").length;

          return (
            <div>
              <Progress
                value={totalComplete}
                total={tasks.length}
                progress="ratio"
                indicating={true}
                success={totalComplete === tasks.length}
              />
              <ProcessTasks tasks={tasks} />
            </div>
          );
        }}
      </Connect>
    );
  }

  private onAddedOrUpdatedTask(
    prevQuery: { getProcess: Process },
    { onAddOrUpdateTask }: { onAddOrUpdateTask: Task },
  ) {
    const updatedQuery = Object.assign({}, prevQuery);

    const invocation = updatedQuery.getProcess.tasks.find(i => i.id === onAddOrUpdateTask.id);
    if (!invocation) {
      updatedQuery.getProcess.tasks.push(onAddOrUpdateTask);
    } else {
      if (!invocation.processId) {
        invocation.processId = onAddOrUpdateTask.processId;
      }
      if (!invocation.name) {
        invocation.name = onAddOrUpdateTask.name;
        // TODO Update schema to make created optional so prior knowledge of knowing that name and created are updated together
        invocation.created = onAddOrUpdateTask.created;
      }
      if (onAddOrUpdateTask.updated > invocation.updated) {
        invocation.updated = onAddOrUpdateTask.updated;
        invocation.status = onAddOrUpdateTask.status;
      }
    }

    return updatedQuery;
  }
}
