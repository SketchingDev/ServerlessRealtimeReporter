export const onCreateProcessSubscription = `
subscription{
  onCreateProcess {
    id,
    name,
    created
  }
}`;

export const onAddOrUpdateTaskSubscription = `
subscription{
  onAddOrUpdateTask {
    id,
	  processId,
	  name,
	  created,
	  updated
	  status,
	  failureReason
  }
}`;
