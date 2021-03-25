defmodule ChatWeb.RoomChannel do
  use ChatWeb, :channel
 alias ChatWeb.Presence
#  @impl true
#  def join("room:lobby", payload, socket) do
#    if authorized?(payload) do
#      {:ok, socket}
#    else
#      {:error, %{reason: "unauthorized"}}
#    end
#  end
  def join("room:lobby", _params, socket) do
   send self(), :after_join
   {:ok, socket}
  end

  def join(_other, _params, socket) do
    {:error, "Room does not exist."}
  end
 def handle_info(:after_join, socket) do
   push socket, "presence_state", Presence.list(socket)
   Presence.track(socket, socket.assigns.user, %{
   online_at: :os.system_time(:milli_seconds)
   })
   {:noreply, socket}
  end

  def handle_in("message:new", message, socket) do
    broadcast! socket, "message:new", %{
    user: socket.assigns.user,
    body: message,
    timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end

#  # Channels can be used in a request/response fashion
#  # by sending replies to requests from the client
#  @impl true
#  def handle_in("ping", payload, socket) do
#    {:reply, {:ok, payload}, socket}
#  end

#  # It is also common to receive messages from the client and
#  # broadcast to everyone in the current topic (room:lobby).
#  @impl true
#  def handle_in("shout", payload, socket) do
#    broadcast socket, "shout", payload
#    {:noreply, socket}
#  end

#  # Add authorization logic here as required.
#  defp authorized?(_payload) do
#    true
#  end
end
