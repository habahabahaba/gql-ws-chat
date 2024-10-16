// Apollo:
import { useMutation, useQuery, useSubscription } from '@apollo/client';
// GraphQL:
import {
  addMessageMutation,
  messageAddedSubscription,
  messagesQuery,
} from './queries';

export function useAddMessage() {
  const [mutate] = useMutation(addMessageMutation);

  const addMessage = async (text) => {
    const {
      data: { message },
    } = await mutate({
      variables: { text },
      // Moved update to subscription.
      // update: (cache, { data }) => {
      //   const newMessage = data.message;
      //   cache.updateQuery({ query: messagesQuery }, ({ messages }) => ({
      //     messages: [...messages, newMessage],
      //   }));
      // },
    });

    return message;
  };

  return { addMessage };
}

export function useMessages() {
  const { data } = useQuery(messagesQuery);
  useSubscription(messageAddedSubscription, {
    onData: ({ client, data }) => {
      const newMessage = data.data.message;
      client.cache.updateQuery({ query: messagesQuery }, ({ messages }) => ({
        messages: [...messages, newMessage],
      }));
    },
  });
  return {
    messages: data?.messages ?? [],
  };
}
