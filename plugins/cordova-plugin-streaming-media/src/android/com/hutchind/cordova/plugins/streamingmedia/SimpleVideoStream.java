package com.hutchind.cordova.plugins.streamingmedia;
import com.vedific.oppo.R;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.graphics.Typeface;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Display;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.AbsListView;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.MediaController;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.VideoView;
import com.android.volley.AuthFailureError;
import com.android.volley.NetworkError;
import com.android.volley.NoConnectionError;
import com.android.volley.ParseError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.ServerError;
import com.android.volley.TimeoutError;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Transformation;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

//import org.java_websocket.client.WebSocketClient;
//import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.net.URL;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import android.text.InputFilter;
import android.text.Spanned;
import java.util.TimerTask;
import android.util.DisplayMetrics;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;

public class SimpleVideoStream extends Activity implements
MediaPlayer.OnCompletionListener, MediaPlayer.OnPreparedListener,
	MediaPlayer.OnErrorListener, MediaPlayer.OnBufferingUpdateListener {
		private String TAG = getClass().getSimpleName();
		private VideoView mVideoView = null;
		private MediaPlayer mMediaPlayer = null;
		private MediaController mMediaController = null;
		private ProgressBar mProgressBar = null;
		private String mVideoUrl;
		private String fullString;
		private String fullStringArray[];
		private String roomIdString = "";
		private String urlString = "";
		private String authorizationString = "";
		private Boolean mShouldAutoClose = true;
		private boolean mControls;
		public static SimpleVideoStream simpleVideoStream;
		public Socket mSocket;
		private RequestQueue requestQueue;
		private Timer timer;
		//private TextView infoText;
		private int messageCount = 0;
		private ImageView buttonSend;	
		TextView textViewChatCount;
		FrameLayout baseFrameLayout, frameLayoutPlayer, frameLayoutChat;
		boolean isChatWindowOn = false;
		ArrayList < MessageData > arrayListMessages = new ArrayList < > ();
		ArrayList < UserData > arrayListUsers = new ArrayList < > ();
		CustomAdapter messageItemsAdapter;
		ListView listView;
		private int width;
		private int height;
		private EditText editText;

		String parent_id = "2";

		String hash_app_id = "app";
		String room_id = "3715467cac8e0f7706aa97a0382e920d";
		String user_id = "199";
		String user_name = "rachit testing";
		String user_image_url = "";
		String device_type = "mobile";
		String app_id = "";
		String orientaion = "";
		int colorWhite, colorBlue, colorBlack, colorTransparent, colorChat1, colorChat2, colorTransparent40, colorRed, colorGreyLight, colorGreyDark;
		String wsToken = "";
		String siteUrl = "";
		String getMessageUrl = "";
		LinearLayout linearLayoutChatAndSendButton;
		 ImageView imageViewChatBurron;
		FrameLayout frameLayoutChatButtonHolder;
		FrameLayout.LayoutParams frameLayoutChatButtonHolderParamsBottom;
		FrameLayout.LayoutParams frameLayoutChatButtonHolderParamsTop;
		FrameLayout.LayoutParams layoutParamsHeaderChatButtonTop;
		FrameLayout.LayoutParams layoutParamsHeaderChatButtonBottom;
		FrameLayout frameLayoutChatParent;
		String dynamicImageUrl = "";
		String mobile_url_socket = "";
		boolean isSocketAlive=false;
		String imageUrlDefault="";
		int iconWidth,iconHeight;
		int indexMessageSendByUser=0;
		int classType=0;
		@Override
		protected void onCreate(Bundle savedInstanceState) {
			
			super.onCreate(savedInstanceState);
			this.requestWindowFeature(Window.FEATURE_NO_TITLE);
			this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

			if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.HONEYCOMB) {
				getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
			}

			colorBlack = Color.parseColor("#000000");
			colorBlue = Color.parseColor("#0000FF");
			colorWhite = Color.parseColor("#FFFFFF");
			colorRed = Color.parseColor("#FF0000");			
			colorChat1 = Color.parseColor("#FFF9CB");
			colorChat2 = Color.parseColor("#DBEBFA");
			colorTransparent = Color.parseColor("#00000000");
			colorTransparent40 = Color.parseColor("#66000000");
			colorGreyLight = Color.parseColor("#808080");
			colorGreyDark = Color.parseColor("#606060");
			
			Display mDisplay = getWindowManager().getDefaultDisplay();
			width = mDisplay.getWidth();
			height = mDisplay.getHeight();
			setIconWithAndHeightWithRespectToDeviceDensity();

			baseFrameLayout = new FrameLayout(this);
			FrameLayout.LayoutParams mainFramePrams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT, Gravity.CENTER);
			baseFrameLayout.setBackgroundColor(colorBlack);
			setContentView(baseFrameLayout, mainFramePrams);

			Bundle b = getIntent().getExtras();

			try {
				mVideoUrl = b.getString("mediaUrl");
				fullString = b.getString("orientation");
				fullStringArray = fullString.split("#");
				showMessage("mVideoUrl : " + mVideoUrl);
				if (fullStringArray.length > 0) {
					if (fullStringArray.length > 0 && fullStringArray[0].length() > 0) {
						urlString = fullStringArray[0];
						showMessage("urlString : " + urlString);
					} else {
						Log.d(TAG, "No data urlString");
					}
					if (fullStringArray.length > 1 && fullStringArray[1].length() > 0) {
						orientaion = fullStringArray[1];
						showMessage("orientaion : " + orientaion);
					} else {
						Log.d(TAG, "No data orientaion");
					}
					if (fullStringArray.length > 2 && fullStringArray[2].length() > 0) {
						room_id = fullStringArray[2];
						roomIdString = fullStringArray[2];
						showMessage("room_id : " + room_id);
					} else {
						Log.d(TAG, "No data roomIdString");
					}
					if (fullStringArray.length > 3 && fullStringArray[3].length() > 0) {
						authorizationString = fullStringArray[3];
						showMessage("authorizationString : " + authorizationString);
					} else {
						Log.d(TAG, "No data authorizationString");
					}
					if (fullStringArray.length > 4 && fullStringArray[4].length() > 0) {
						user_id = fullStringArray[4];
						showMessage("user_id : " + user_id);
					} else {
						Log.d(TAG, "No data parent_id");
					}
					if (fullStringArray.length > 5 && fullStringArray[5].length() > 0) {
						user_name = fullStringArray[5];
						showMessage("user_name : " + user_name);
					} else {
						Log.d(TAG, "No data user_name");
					}
					if (fullStringArray.length > 6 && fullStringArray[6].length() > 0) {
						user_image_url = fullStringArray[6];
						if(user_image_url.trim().length() <= 0 ){
							user_image_url = siteUrl+"/mod/vedificvc/pix/defaultuser.png";
						}
						showMessage("user_image_url : " + user_image_url);
					} else {
						Log.d(TAG, "No data image_url");
					}
					if (fullStringArray.length > 7 && fullStringArray[7].length() > 0) {
						device_type = fullStringArray[7];
						showMessage("device_type : " + device_type);
					} else {
						Log.d(TAG, "No data device_type");
					}
					if (fullStringArray.length > 8 && fullStringArray[8].length() > 0) {
						app_id = fullStringArray[8];
						showMessage("app_id : " + app_id);
					} else {
						Log.d(TAG, "No data app_id");
					}
					if (fullStringArray.length > 9 && fullStringArray[9].length() > 0) {
						hash_app_id = fullStringArray[9];
						showMessage("hash_app_id : " + hash_app_id);
					} else {
						Log.d(TAG, "No data hash_app_id");
					}
					if (fullStringArray.length > 10 && fullStringArray[10].length() > 0) {
						wsToken = fullStringArray[10];
						showMessage("wsToken : " + wsToken);
					} else {
						Log.d(TAG, "No data wsToken");
					}
					if (fullStringArray.length > 11 && fullStringArray[11].length() > 0) {
						siteUrl = fullStringArray[11];
						getMessageUrl = siteUrl + "/webservice/rest/server.php";
						imageUrlDefault=siteUrl+"/mod/vedificvc/pix/defaultuser.png";
						// if(user_image_url.contains("image.php")){
						// 	user_image_url = imageUrlDefault;
						// }
						showMessage("siteUrl : " + siteUrl);
						showMessage("getMessageUrl : " + getMessageUrl);
					} else {
						Log.d(TAG, "No data siteUrl");
					}
					if (fullStringArray.length > 12 && fullStringArray[12].length() > 0) {
						socketUrl = fullStringArray[12];
						showMessage("socketUrl : " + socketUrl);
					} else {
						Log.d(TAG, "No data socketUrl");
					}

					if (fullStringArray.length > 13 && fullStringArray[13].length() > 0) {
					try {
						classType = Integer.parseInt(fullStringArray[13]);
						showMessage("classType : " + classType);
						}catch (NumberFormatException e){
							showMessage("NumberFormatException");
							showMessage("No data classType");
						}
					} else {
						showMessage("No data classType");
						classType=0;
					}

					arrayListUsers.add(new UserData(user_id, user_name, user_image_url));
				} else {
					Log.d(TAG, "No data from bundle");
				}

				mShouldAutoClose = b.getBoolean("shouldAutoClose", true);
				mControls = b.getBoolean("controls", true);
			} catch (Exception e) {
				e.printStackTrace();
				Log.d(TAG, "No data from bundle");
				mVideoUrl = "";
				fullString = "";
				urlString = "";
				roomIdString = "";
				authorizationString = "";
			}


			FrameLayout.LayoutParams relLayoutParam = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT, Gravity.CENTER);
			mVideoView = new VideoView(this);
			mVideoView.setLayoutParams(relLayoutParam);
			baseFrameLayout.addView(mVideoView);


			// infoText = new TextView(this);
			// infoText.setTextSize(20);
			// FrameLayout.LayoutParams layoutParamsInfoText = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER);
			// infoText.setLayoutParams(layoutParamsInfoText);
			// infoText.setText("Start");
			// infoText.setTypeface(null, Typeface.BOLD);
			// baseFrameLayout.addView(infoText);
			// infoText.bringToFront();

			// Create progress throbber
			mProgressBar = new ProgressBar(this);
			mProgressBar.setIndeterminate(true);
			// Center the progress bar
			FrameLayout.LayoutParams pblp = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER);
			mProgressBar.setLayoutParams(pblp);
			// Add progress throbber to view
			baseFrameLayout.addView(mProgressBar);
			mProgressBar.bringToFront();
			setOrientation(orientaion);

			play();
			initialiseSocket();

			if(classType==1) {
				getMessagesRequest(getMessageUrl);
				showMessage(getMessageUrl);
			}
			setChatWindow(baseFrameLayout,classType);

		}

		public void setIconWithAndHeightWithRespectToDeviceDensity(){
			DisplayMetrics metrics = new DisplayMetrics();
			getWindowManager().getDefaultDisplay().getMetrics(metrics);
			if(metrics.densityDpi<=DisplayMetrics.DENSITY_260){
				showMessage("DisplayMetrics.DENSITY_VLOW");
				iconHeight=80;
				iconWidth=80;
			}else if(metrics.densityDpi>DisplayMetrics.DENSITY_260&&metrics.densityDpi<=DisplayMetrics.DENSITY_280){
				iconHeight=80;
				iconWidth=80;
				showMessage("DisplayMetrics.DENSITY_LOW");
			}else if(metrics.densityDpi>DisplayMetrics.DENSITY_280&&metrics.densityDpi<=DisplayMetrics.DENSITY_340){
				iconHeight=100;
				iconWidth=100;
				showMessage("DisplayMetrics.DENSITY_MEDIUM");
			}else if(metrics.densityDpi>DisplayMetrics.DENSITY_340&&metrics.densityDpi<=DisplayMetrics.DENSITY_420){
				iconHeight=140;
				iconWidth=140;
				showMessage("DisplayMetrics.DENSITY_HIGH");
			}else if(metrics.densityDpi>DisplayMetrics.DENSITY_420&&metrics.densityDpi<=DisplayMetrics.DENSITY_560){
				iconHeight=160;
				iconWidth=160;
				showMessage("DisplayMetrics.DENSITY_XHIGH");
			}else if(metrics.densityDpi>DisplayMetrics.DENSITY_560){
				showMessage("DisplayMetrics.DENSITY_XXHIGH");
				iconHeight=180;
				iconWidth=180;
			}
		}

		private void play() {
			mProgressBar.setVisibility(View.VISIBLE);
			Uri videoUri = Uri.parse(mVideoUrl);
			try {
				mVideoView.setOnCompletionListener(this);
				mVideoView.setOnPreparedListener(this);
				mVideoView.setOnErrorListener(this);
				mVideoView.setVideoURI(videoUri);
				mMediaController = new MediaController(this);
				mMediaController.setAnchorView(mVideoView);
				mMediaController.setMediaPlayer(mVideoView);
				if (!mControls) {
					mMediaController.setVisibility(View.GONE);
				}
				mVideoView.setMediaController(mMediaController);
			} catch (Throwable t) {
				Log.d(TAG, t.toString());
				//infoText.setText(t.getMessage());
			}
		}

		private void setOrientation(String orientaion) {
            if(orientaion.equalsIgnoreCase("landscape")) {
                this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            }else{
                this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT); 
            }
        }

		private Runnable checkIfPlaying = new Runnable() {
			@Override
			public void run() {
				if (mVideoView.getCurrentPosition() > 0) {
					mProgressBar.setVisibility(View.GONE);
				} else {
					mVideoView.postDelayed(checkIfPlaying, 100);
				}
			}
		};

		public void updateMessageListForSendAndReceived(String sendReceived) {
			if(arrayListMessages.size()>indexMessageSendByUser) {
       			arrayListMessages.get(indexMessageSendByUser).setSendReceived(sendReceived);
    		} 
			messageItemsAdapter.notifyDataSetChanged();
			listView.setSelection(listView.getAdapter().getCount()-1);
			if (!isChatWindowOn) {
				messageCount++;
			}
		}

		@Override
		public void onPrepared(MediaPlayer mp) {
			Log.d(TAG, "Stream is prepared");
			mMediaPlayer = mp;
			mMediaPlayer.setOnBufferingUpdateListener(this);
			mVideoView.requestFocus();
			mVideoView.start();
			mVideoView.postDelayed(checkIfPlaying, 0);
		}


		private void pause() {
			Log.d(TAG, "Pausing video.");
			mVideoView.pause();
		}

		private void stop() {
			Log.d(TAG, "Stopping video.");
			mVideoView.stopPlayback();
		}

		@Override
		protected void onStop() {
			super.onStop(); // Always call the superclass method first
			//timer.cancel();
			// removeSockets();
			stop();
		}

		@Override
		public void onDestroy() {
			super.onDestroy();
            setOrientation("");
			removeSockets();
		}

		public void wrapItUp(int resultCode, String message) {
			Log.d(TAG, "wrapItUp was triggered.");
			//Toast.maketext(this,"wrapItUp was triggered.+",Toast.LENGTH_SHORT).show();
			Intent intent = new Intent();
			intent.putExtra("message", message);
			setResult(resultCode, intent);
			finish();
		}

		public void onCompletion(MediaPlayer mp) {
			Log.d(TAG, "onCompletion triggered.");
			stop();
			if (mShouldAutoClose) {
				wrapItUp(RESULT_OK, null);
			}
		}

		public boolean onError(MediaPlayer mp, int what, int extra) {
			try{
			StringBuilder sb = new StringBuilder();
			sb.append("MediaPlayer Error: ");
			switch (what) {
				case MediaPlayer.MEDIA_ERROR_NOT_VALID_FOR_PROGRESSIVE_PLAYBACK:
					sb.append("Not Valid for Progressive Playback");
					break;
				case MediaPlayer.MEDIA_ERROR_SERVER_DIED:
					sb.append("Server Died");
					break;
				case MediaPlayer.MEDIA_ERROR_UNKNOWN:
					sb.append("Unknown");
					break;
				default:
					sb.append(" Non standard (");
					sb.append(what);
					sb.append(")");
			}
			sb.append(" (" + what + ") ");
			sb.append(extra);
			Log.e(TAG, sb.toString());
			mProgressBar.setVisibility(View.GONE);
			wrapItUp(RESULT_CANCELED, sb.toString());
			}catch(Exception e){
				e.printStackTrace();
			}
			return true;
		}

		public void onBufferingUpdate(MediaPlayer mp, int percent) {
			//Log.d(TAG, "onBufferingUpdate : " + percent + "%");
		}


		 @Override
    public void onBackPressed() {
        //removeSockets();
        if (isChatWindowOn) {
            if (linearLayoutChatAndSendButton != null && linearLayoutChatAndSendButton.getVisibility() == View.VISIBLE) {
                linearLayoutChatAndSendButton.setVisibility(View.GONE);
				frameLayoutChatParent.setBackgroundColor(colorTransparent);
                isChatWindowOn = false;
                try {
                    Picasso.with(SimpleVideoStream.this)
                            .load(siteUrl+"/mod/vedificvc/pix/chat_button_image.png")
                            .resize(iconWidth, iconHeight)
                            .transform(new CircleTransform())
                            .into(imageViewChatBurron, new com.squareup.picasso.Callback() {
                                @Override
                                public void onSuccess() {
                                }

                                @Override
                                public void onError() {
                                }
                            });


                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            frameLayoutChatButtonHolder.setLayoutParams(frameLayoutChatButtonHolderParamsBottom);
            imageViewChatBurron.setLayoutParams(layoutParamsHeaderChatButtonBottom);
            textViewChatCount.setVisibility(View.VISIBLE);
        } else {
            wrapItUp(RESULT_OK, null);
        }

    }


		@Override
		public void onConfigurationChanged(Configuration newConfig) {
			// The screen size changed or the orientation changed... don't restart the activity
			super.onConfigurationChanged(newConfig);
		}

		@Override
		public boolean onTouchEvent(MotionEvent event) {
			if (mMediaController != null)
				mMediaController.show();
			return false;
		}


		public void removeSockets() {
			if(mSocket!=null) {
				isSocketAlive=false;
				mSocket.close();
				mSocket.disconnect();
				mSocket.off();
				mSocket=null;			
			}
			if(timer!=null) {
				timer.cancel();
			}
			showMessage("Socket Disonnected!");
		}
		String socketUrl;

		private void initialiseSocket() {
			try {
				socketUrl = socketUrl + "/?app_id=" + app_id + "&room_id=" + room_id + "&user_id=" + user_id + "&user_name=" + user_name.replace(" ", "_") + "&image_url=" + user_image_url + "&device_type=app&mobile_image_url="+mobile_url_socket;
				//socketUrl = socketUrl + "/?app_id=" + app_id + "&room_id=" + room_id + "&user_id=" + user_id + "&user_name=" + user_name + "&image_url=" + user_image_url + "&device_type=app";
				showMessage(socketUrl);

				IO.Options opts = new IO.Options();
				opts.transports=new String[]{"websocket"};

				mSocket = IO.socket(socketUrl,opts);
				mSocket.connect();

				mSocket.emit("sync", "");
				mSocket.on("sync", onNewMessageSync);
				mSocket.on("rooms", onNewMessageRooms);
				mSocket.on("message", onNewMessage);
				mSocket.on("users", onNewMessageUsers);
				mSocket.on("connect", onConnected);
				mSocket.on("disconnect", onDisConnected);
				mSocket.on("connect_error", onConnectError);
				
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		private Emitter.Listener onConnected = new Emitter.Listener() {
			@Override
			public void call(final Object... args) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						showMessage("onConnected");
						isSocketAlive=true;
					}
				});
			}
		};

		private Emitter.Listener onConnectError = new Emitter.Listener() {
			@Override
			public void call(final Object... args) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						showMessage("onConnectError");
						isSocketAlive=false;
						wrapItUp(0, "OK");
					}
				});
			}
		};

		private Emitter.Listener onDisConnected = new Emitter.Listener() {
			@Override
			public void call(final Object... args) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						showMessage("onDisConnected");
						if(isSocketAlive&&mSocket!=null) {
							mSocket.connect();
						}
						isSocketAlive=false;
					}
				});
			}
		};



		private Emitter.Listener onNewMessageSync = new Emitter.Listener() {
			@Override
			public void call(final Object...args) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						showMessage("Socket Connected!");
						JSONObject data = (JSONObject) args[0];
						if (data == null) {
							showMessage("no data from socket Personal");
							return;
						}
						try {
							if (data.has("code")) {
								if (data.getString("code").equalsIgnoreCase("session")) {
									showMessage("session found");
								}
							}
							if (data.has("eventId")) {
								if (data.getString("eventId").equalsIgnoreCase("duplicate")) {
									wrapItUp(0, "OK");
								}
							}
						} catch (JSONException e) {
							showMessage("JSONException Personal");
							e.printStackTrace();
							return;
						}
					}
				});
			}
		};

		private Emitter.Listener onNewMessage = new Emitter.Listener() {
			@Override
			public void call(final Object...args) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						showMessage("onNewMessage Socket Connected!");
						JSONObject data = (JSONObject) args[0];
						if (data == null) {
							showMessage("no data from socket Personal");
							return;
						}
						showMessage("message : " + data.toString());
						try {
							if (data.has("code")) {
								if (data.getString("code").equalsIgnoreCase("chat")) {
									if (data.has("data")) {
										JSONObject dataMessage = data.getJSONObject("data");
										showMessage("sent_to : "+dataMessage.isNull("sent_to"));
										if (dataMessage.has("message")&& (dataMessage.isNull("sent_to"))) { // send_to is null for brodcast message
											String message = dataMessage.getString("message");
											String user_Id = dataMessage.getString("user_id");
											String time = dataMessage.getString("created_time");
											if (message.length() > 0) {
												if(user_Id.equalsIgnoreCase(user_id)) {
													postMessagesToServer(getMessageUrl, message, user_Id);
													updateMessageListForSendAndReceived(null);
													if(timer!=null) timer.cancel();
										
													buttonSend.setEnabled(true);
												}else{
													updateMessageList(user_Id,message,time,"sending...");
													buttonSend.setEnabled(true);
												}
											}
										}
									}
								} else if (data.getString("code").equalsIgnoreCase("users")) {
									if (data.getString("eventId").equalsIgnoreCase("all")) {
										if (data.has("users")) {
											JSONArray jsonArray = data.getJSONArray("users");
											String name_users = "";
											String id_users = "";
											String image_url_users = "";
											for (int i = 0; i < jsonArray.length(); i++) {
												JSONObject usersObject = jsonArray.getJSONObject(i);
												try {
													if (usersObject.has("mobile_image_url")) {
														image_url_users = usersObject.getString("mobile_image_url");
													}
													if (usersObject.has("name")) {
														name_users = usersObject.getString("name");
													}
													if (usersObject.has("user_id")) {
														id_users = usersObject.getString("user_id");
													}
													if (name_users != null && id_users != null & image_url_users != null) {
														UserData userData = new UserData(id_users, name_users, image_url_users);
														if (!isObjectExist(arrayListUsers, id_users)) {
															arrayListUsers.add(userData);
														}
													}
												} catch (JSONException e) {
													showMessage("onNewMessage JSONException onNewMessageUsers");
													e.printStackTrace();
													return;
												}
											}
										}
									} else {
										showMessage("onNewMessage eventId not found");
									}
								} else if (data.has("eventId")) {
									if (data.getString("eventId").equalsIgnoreCase("duplicate")) {
										wrapItUp(0, "OK");
									}
								}
							}
						} catch (Exception e) {
							showMessage("JSONException Personal");
							e.printStackTrace();
							return;
						}
					}
				});
			}
		};

		public void updateMessageList(String user_id, String message, String time,String sendReceived) {
			String name = "No Name";
			String image_url = siteUrl+"/mod/vedificvc/pix/defaultuser.png";
			for (int i = 0; i < arrayListUsers.size(); i++) {
				UserData userData = arrayListUsers.get(i);
				if (userData.getUser_id().equalsIgnoreCase(user_id)) {
					name = userData.getUser_name();
					image_url = userData.getUser_image();
					break;
				}
			}
			arrayListMessages.add(new MessageData(user_id, name, message, image_url, time,sendReceived));
			if(this.user_id.equalsIgnoreCase(user_id)){
     		   indexMessageSendByUser=arrayListMessages.size()-1;
    		}
			messageItemsAdapter.notifyDataSetChanged();
			listView.setSelection(listView.getAdapter().getCount()-1);
			messageCount++;
			textViewChatCount.setText(""+messageCount); 
			if (!isChatWindowOn) {
				if(messageCount>0){       
					textViewChatCount.setVisibility(View.VISIBLE);
				}
			}
			
		}

		public boolean isObjectExist(ArrayList arrayListUsers, String id) {
			for (Object userData: arrayListUsers) {
				if (((UserData) userData).getUser_id().equalsIgnoreCase(id)) {
					return true;
				}
			}
			return false;
		}

		private Emitter.Listener onNewMessageUsers = new Emitter.Listener() {
			@Override
			public void call(final Object...args) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						showMessage("Socket Connected onNewMessageUsers!");
						JSONObject dataUser = (JSONObject) args[0];
						String name = "";
						String user_id = "";
						String image_url = "";
						if (dataUser == null) {
							showMessage("from socket onNewMessageUsers");
							return;
						}
						try {
							//showMessage("users : "+data.toString());
							if (dataUser.has("mobile_image_url")) {
								image_url = dataUser.getString("mobile_image_url");
							} else {
								image_url = siteUrl+"/mod/vedificvc/pix/defaultuser.png";
								showMessage(image_url);
							}

							if (dataUser.has("name")) {
								name = dataUser.getString("name");
							} else {
								name = "No name";
								showMessage(name);
							}
							if (dataUser.has("user_id")) {
								user_id = dataUser.getString("user_id");
							} else {
								user_id = "No user_id";
								showMessage(user_id);
							}
							UserData userData = new UserData(user_id, name, image_url);
							if (!isObjectExist(arrayListUsers, user_id)) {
								arrayListUsers.add(userData);
							}
							Log.d("TAG", arrayListUsers.toArray().toString());
						} catch (JSONException e) {
							showMessage("JSONException Personal");
							e.printStackTrace();
							return;
						}
					}
				});
			}
		};

		private Emitter.Listener onNewMessagePersonal = new Emitter.Listener() {
			@Override
			public void call(final Object...args) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						JSONObject data = (JSONObject) args[0];
						if (data == null) {
							showMessage("no data from socket Personal");
							return;
						}
						try {
							if (data.has("code")) {
								if (data.getString("code").equalsIgnoreCase("session")) {
									showMessage("session found");
								}
							}
							if (data.has("eventId")) {
								if (data.getString("eventId").equalsIgnoreCase("duplicate")) {
									wrapItUp(0, "OK");
								}
							}
						} catch (JSONException e) {
							showMessage("JSONException Personal");
							e.printStackTrace();
							return;
						}
					}
				});
			}
		};

		private Emitter.Listener onNewMessageRooms = new Emitter.Listener() {
			String socketStatus = "";

			@Override
			public void call(final Object...args) {
				runOnUiThread(new Runnable() {
					String message = "Stream id : ";

					@Override
					public void run() {
						JSONObject data = (JSONObject) args[0];
						if (data == null) {
							showMessage("no data from socket");
							return;
						}

						try {
							if (data.has("id")) {
								message = message + data.getString("id") + "\n";
							}
							if (data.has("muted")) {
								showMessage("muted : " + data.getString("muted"));
							}
							if (data.has("status")) {
								message = message + "Status : " + data.getString("status");
								socketStatus = data.getString("status");
								if (socketStatus != null && socketStatus.length() > 0) {
									if (socketStatus.equalsIgnoreCase("paused")) {
										showMessage("paused");
									} else if (socketStatus.equalsIgnoreCase("playing")) {
										showMessage("playing");
									} else if (socketStatus.equalsIgnoreCase("stopped")) {
										showMessage("stopped");
										Toast.makeText(SimpleVideoStream.this,"Class has been closed by teacher!",Toast.LENGTH_SHORT).show();
										wrapItUp(0, "OK");
									} else {
										showMessage(socketStatus);
									}
								} else {
									showMessage("no staus!");
								}
							}
						} catch (JSONException e) {
							e.printStackTrace();
							return;
						}
					}
				});
			}
		};

		private void showMessage(String message) {
			Log.d(TAG, message);
		}

		public void setChatWindow(FrameLayout baseFrameLayout,int _classType){
			FrameLayout.LayoutParams framLayoutParams;
            float weight = 1.0f;
			if (height > width) { // portrait
				framLayoutParams = new FrameLayout.LayoutParams(height / 2, width, Gravity.LEFT | Gravity.BOTTOM);
			} else {
				framLayoutParams = new FrameLayout.LayoutParams(width / 2, height, Gravity.LEFT | Gravity.BOTTOM);
			}

			frameLayoutChatParent = new FrameLayout(this);
			frameLayoutChatParent.setLayoutParams(framLayoutParams);
			frameLayoutChatParent.setBackgroundColor(colorTransparent);
			

			linearLayoutChatAndSendButton = new LinearLayout(this);
            FrameLayout.LayoutParams linearLayoutChatAndSendButtonParams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM);
			linearLayoutChatAndSendButtonParams.setMargins(10, iconHeight, 10, 0);
            linearLayoutChatAndSendButton.setLayoutParams(linearLayoutChatAndSendButtonParams);
			linearLayoutChatAndSendButton.setOrientation(LinearLayout.VERTICAL);
			linearLayoutChatAndSendButton.setVisibility(View.GONE);
			linearLayoutChatAndSendButton.setGravity(Gravity.BOTTOM);

			//header
			frameLayoutChatButtonHolder = new FrameLayout(this);
			frameLayoutChatButtonHolderParamsBottom = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, iconHeight, Gravity.BOTTOM);
			frameLayoutChatButtonHolderParamsTop = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, iconHeight, Gravity.TOP);
			frameLayoutChatButtonHolder.setLayoutParams(frameLayoutChatButtonHolderParamsBottom);


			layoutParamsHeaderChatButtonTop = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.END);
			layoutParamsHeaderChatButtonBottom = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.START);


			imageViewChatBurron = new ImageView(this);
			//chat comment
			//imageViewChatBurron.setVisibility(View.GONE);
			imageViewChatBurron.setLayoutParams(layoutParamsHeaderChatButtonBottom);

			messageCount = arrayListMessages.size();
			
            Picasso.with(SimpleVideoStream.this)
						.load(siteUrl+"/mod/vedificvc/pix/chat_button_image.png")
						.resize(iconWidth, iconHeight)
						.transform(new CircleTransform())
						.into(imageViewChatBurron);
			imageViewChatBurron.setPadding(10, 10, 10, 10);
			imageViewChatBurron.setOnClickListener(new View.OnClickListener() {
				@Override
				public void onClick(View v) {
					if (isChatWindowOn) {
						linearLayoutChatAndSendButton.setVisibility(View.GONE);
						isChatWindowOn = false;
						 frameLayoutChatButtonHolder.setLayoutParams(frameLayoutChatButtonHolderParamsBottom);
						imageViewChatBurron.setLayoutParams(layoutParamsHeaderChatButtonBottom);
						frameLayoutChatParent.setBackgroundColor(colorTransparent);
						try {
							Picasso.with(SimpleVideoStream.this)
									.load(siteUrl+"/mod/vedificvc/pix/chat_button_image.png")
									.resize(iconWidth, iconHeight)
									.transform(new CircleTransform())
									.into(imageViewChatBurron);

							if(messageCount>0) {
								textViewChatCount.setVisibility(View.VISIBLE);							
							}
						} catch (Exception e) {
							e.printStackTrace();
						}
						} else {
						frameLayoutChatButtonHolder.setLayoutParams(frameLayoutChatButtonHolderParamsTop);
                    	imageViewChatBurron.setLayoutParams(layoutParamsHeaderChatButtonTop);
						linearLayoutChatAndSendButton.setVisibility(View.VISIBLE);
						listView.setSelection(listView.getAdapter().getCount()-1);
						frameLayoutChatParent.setBackgroundColor(colorTransparent40);
						isChatWindowOn = true;
						try {
                        	Picasso.with(SimpleVideoStream.this)
                                .load(siteUrl+"/mod/vedificvc/pix/close.png")
                                .resize(iconWidth, iconHeight)
                                .into(imageViewChatBurron);

							textViewChatCount.setVisibility(View.GONE);
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				}
			});
			
			if(_classType==0){
				imageViewChatBurron.setVisibility(View.GONE);
				if(textViewChatCount!=null){
					textViewChatCount.setVisibility(View.GONE);
				}
			}else{
				imageViewChatBurron.setVisibility(View.VISIBLE);
			}

			frameLayoutChatButtonHolder.addView(imageViewChatBurron);
			GradientDrawable shape =  new GradientDrawable();
			shape.setCornerRadius(iconWidth);
			shape.setColor(colorRed);
			textViewChatCount=new TextView(this);
			FrameLayout.LayoutParams layoutParamsTextViewChatCount = new FrameLayout.LayoutParams(iconWidth/2, iconHeight/2, Gravity.START);
			layoutParamsTextViewChatCount.setMargins(5,0,0,0);
			textViewChatCount.setPadding(5,5,5,5);
			textViewChatCount.setGravity(Gravity.CENTER);
			textViewChatCount.setTextSize(10);
			textViewChatCount.setLayoutParams(layoutParamsTextViewChatCount);
			textViewChatCount.setTextColor(colorWhite);
			frameLayoutChatButtonHolder.addView(textViewChatCount);
			textViewChatCount.setBackground(shape);
			textViewChatCount.setText(""+messageCount);
			if(messageCount>0){
				textViewChatCount.setVisibility(View.VISIBLE);
			}else{
				textViewChatCount.setVisibility(View.GONE);
			} 

			//body
			listView = new ListView(this);
			LinearLayout.LayoutParams layoutParamsList = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, weight);
			listView.setLayoutParams(layoutParamsList);
			messageItemsAdapter = new CustomAdapter(this, arrayListMessages, arrayListMessages.size());
			listView.setAdapter(messageItemsAdapter);
			listView.setSelection(listView.getAdapter().getCount()-1);
			listView.setBackgroundColor(colorTransparent);
			listView.setDivider(null);
			listView.setDividerHeight(0);
			linearLayoutChatAndSendButton.addView(listView);
			//bottom
			//        View view = new View(SimpleVideoStream.this);
			//        view.setBackgroundColor(colorBlue);
			//        LinearLayout.LayoutParams layoutParamsView = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 1);
			//        view.setLayoutParams(layoutParamsView);
			//        linearLayoutChatAndSendButton.addView(view);

			LinearLayout linearLayoutBottom = new LinearLayout(this);
			linearLayoutBottom.setGravity(Gravity.CENTER_VERTICAL);
			linearLayoutBottom.setOrientation(LinearLayout.HORIZONTAL);
			LinearLayout.LayoutParams layoutParamsEdittext = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, iconHeight-20, weight);
			layoutParamsEdittext.setMargins(0, 5, 0, 5);
			editText = new EditText(this);
			editText.setLayoutParams(layoutParamsEdittext);
			editText.setBackground(getDrawableWithRadius(colorWhite, 50));
			editText.setHint("Write a message...");
			editText.setTextSize(15);
			editText.setTextColor(colorBlack);
			editText.setPadding(30, 0, 0, 0);
			editText.setImeOptions(EditorInfo.IME_ACTION_SEND);
			InputFilter filter = new InputFilter() {
			@Override
			public CharSequence filter(CharSequence source, int start, int end, Spanned dest, int dstart, int dend) {
				for (int i = start; i < end; i++) {
					int type = Character.getType(source.charAt(i));
					if (type == Character.SURROGATE || type == Character.OTHER_SYMBOL) {
						return "";
					}
				}
				return null;
				}
			};

			editText.setFilters(new InputFilter[]{filter});
			buttonSend = new ImageView(this);
            Picasso.with(SimpleVideoStream.this)
						.load(siteUrl+"/mod/vedificvc/pix/image_send_button.png")
						.resize(iconWidth, iconHeight)
                		.into(buttonSend);


			FrameLayout.LayoutParams layoutParamsButtonSend = new FrameLayout.LayoutParams(iconWidth, iconHeight, Gravity.BOTTOM | Gravity.END);			
			buttonSend.setLayoutParams(layoutParamsButtonSend);
			layoutParamsButtonSend.setMargins(0, 5, 0, 5);
			buttonSend.setPadding(10, 10, 10, 10);
			buttonSend.setMinimumWidth(90);
			buttonSend.setMinimumHeight(90);
			buttonSend.setMaxHeight(100);
			buttonSend.setMaxWidth(100);

			editText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
    			@Override
				public boolean onEditorAction(TextView v, int actionId, KeyEvent event){
					if(actionId == EditorInfo.IME_ACTION_SEND){
						sendMessage(v);
						return true;
					}
					return false;
				}
			});


			buttonSend.setOnClickListener(new View.OnClickListener() {
				@Override
				public void onClick(View v) {
					sendMessage(v);
				}
			});

			linearLayoutBottom.addView(editText);
			linearLayoutBottom.addView(buttonSend);
			linearLayoutChatAndSendButton.addView(linearLayoutBottom);
			frameLayoutChatParent.addView(linearLayoutChatAndSendButton);
			frameLayoutChatParent.addView(frameLayoutChatButtonHolder);
			baseFrameLayout.addView(frameLayoutChatParent);
		}

		public void sendMessage(View view){
			String textMessage = editText.getText().toString();
			textMessage=textMessage.trim();

			if (textMessage.trim().length() > 0) {
				JSONObject jsonObjectSender = new JSONObject();
				final JSONObject jsonObjectReceiver = new JSONObject();
				SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm a");
				Date date = new Date();
				String nullString = null;
				if (mSocket != null && user_id != null) {
					try {
						jsonObjectReceiver.put("code", "chat");
						jsonObjectReceiver.put("eventId", "created");
						jsonObjectReceiver.put("sent_to", "null");
						jsonObjectSender.put("user_id", user_id);
						jsonObjectSender.put("is_read", "0");
						jsonObjectSender.put("message", textMessage);
						jsonObjectSender.put("created_time", dateFormat.format(date));
						jsonObjectReceiver.put("data", jsonObjectSender);
					} catch (JSONException e) {
						e.printStackTrace();
					}
					if (jsonObjectReceiver != null) {
						updateMessageList(user_id, textMessage, dateFormat.format(date), "sending...");
						editText.setText("");
						timer = new Timer();
						timer.scheduleAtFixedRate(new TimerTask() {
							@Override
							public void run() {
								mSocket.emit("message", jsonObjectReceiver);
								showMessage("Sending again : " + jsonObjectReceiver.toString());
							}
						}, 0, 2000);//put here time 1000 milliseconds=1 second
						buttonSend.setEnabled(false);
					} else {
						showMessage("SEND JSON Oblect is null");
					}
				} else {
				}
				InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
				imm.hideSoftInputFromWindow(view.getWindowToken(), 0);

			} else {
				showMessage("textMessage is null");
			}


		}

		private Drawable getDrawableWithRadius(int color, float radius) {
			GradientDrawable gradientDrawable = new GradientDrawable();
			gradientDrawable.setCornerRadii(new float[]{radius, radius, radius, radius, radius, radius, radius, radius});
			gradientDrawable.setColor(color);
			return gradientDrawable;
		}
		public class CustomAdapter extends BaseAdapter {
			private ArrayList < MessageData > dataSet;
			Context mContext;
			int limit;

			private class ViewHolder {
				TextView textViewMessage;
				ImageView imageViewMessage;
				ImageView imageViewArrow;
				TextView textViewName;
				TextView textViewTime;
				LinearLayout messageLinearLayout;
			}


			public CustomAdapter(Context context, ArrayList < MessageData > data, int size) {
				this.dataSet = data;
				this.mContext = context;
				this.limit = size;
			}

			@Override
			public int getCount() {
				return dataSet.size();
			}

			@Override
			public Object getItem(int position) {
				return dataSet.get(position);
			}

			@Override
			public long getItemId(int position) {
				return position;
			}

			@Override
			public View getView(int position, View convertView, ViewGroup parent) {
				// Get the data item for this position
				MessageData dataModel = (MessageData) getItem(position);
                float weight = 1.0f;
				// Check if an existing view is being reused, otherwise inflate the view
				CustomAdapter.ViewHolder viewHolder = null; // view lookup cache stored in tag

				//if (convertView == null) {
				viewHolder = new CustomAdapter.ViewHolder();

				FrameLayout.LayoutParams layoutParamsImage = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.TOP);
				viewHolder.imageViewMessage = new ImageView(SimpleVideoStream.this);
				viewHolder.imageViewMessage.setLayoutParams(layoutParamsImage);
				viewHolder.imageViewMessage.setPadding(0, 0, 0, 0);
				viewHolder.imageViewMessage.setMinimumWidth(100);
				viewHolder.imageViewMessage.setMinimumHeight(100);
				viewHolder.imageViewMessage.setMaxHeight(120);
				viewHolder.imageViewMessage.setMaxWidth(120);


				viewHolder.imageViewArrow = new ImageView(SimpleVideoStream.this);
				FrameLayout.LayoutParams imageViewArrowParams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.TOP);
				viewHolder.imageViewArrow.setLayoutParams(imageViewArrowParams);


				viewHolder.messageLinearLayout = new LinearLayout(SimpleVideoStream.this);
				viewHolder.messageLinearLayout.setOrientation(LinearLayout.VERTICAL);
				LinearLayout.LayoutParams messageLinearLayoutParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER_VERTICAL);
				viewHolder.messageLinearLayout.setLayoutParams(messageLinearLayoutParams);

				FrameLayout messageNameAndTimeFrameLayout = new FrameLayout(SimpleVideoStream.this);
				LinearLayout.LayoutParams messageNameAndTimeFrameParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER_VERTICAL);
				messageNameAndTimeFrameParams.setMargins(20, 5, 20, 5);
				messageNameAndTimeFrameLayout.setLayoutParams(messageNameAndTimeFrameParams);

				viewHolder.textViewName = new TextView(SimpleVideoStream.this);
				FrameLayout.LayoutParams layoutParamsTextViewName1 = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.LEFT);
				viewHolder.textViewName.setLayoutParams(layoutParamsTextViewName1);
				viewHolder.textViewName.setTextColor(colorBlack);
				viewHolder.textViewName.setPadding(0, 5, 5, 0);
				messageNameAndTimeFrameLayout.addView(viewHolder.textViewName);

				viewHolder.textViewTime = new TextView(SimpleVideoStream.this);
				FrameLayout.LayoutParams layoutParamsTextViewTime1 = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.RIGHT);
				viewHolder.textViewTime.setLayoutParams(layoutParamsTextViewTime1);
				viewHolder.textViewTime.setPadding(5, 5, 5, 0);
				viewHolder.textViewTime.setTextColor(colorGreyLight);
				messageNameAndTimeFrameLayout.addView(viewHolder.textViewTime);
				

				viewHolder.messageLinearLayout.addView(messageNameAndTimeFrameLayout);
				viewHolder.textViewMessage = new TextView(SimpleVideoStream.this);
				LinearLayout.LayoutParams layoutParamsTextView1 = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER);
				layoutParamsTextView1.setMargins(20, 0, 5, 5);
				viewHolder.textViewMessage.setLayoutParams(layoutParamsTextView1);
				viewHolder.textViewMessage.setGravity(Gravity.CENTER_VERTICAL);
				
				viewHolder.textViewMessage.setTextColor(colorGreyDark);
				viewHolder.messageLinearLayout.addView(viewHolder.textViewMessage);


				if (user_id.equalsIgnoreCase(dataModel.getUser_id())) {
					LinearLayout linearLayoutChatViewBase2 = new LinearLayout(SimpleVideoStream.this);
					LinearLayout.LayoutParams layoutParamsChatViewBase2 = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER_VERTICAL);
					layoutParamsChatViewBase2.setMargins(0, 10, 0, 10);
					linearLayoutChatViewBase2.setLayoutParams(layoutParamsChatViewBase2);
					linearLayoutChatViewBase2.setPadding(0, 5, 0, 5);
					linearLayoutChatViewBase2.setOrientation(LinearLayout.HORIZONTAL);
					linearLayoutChatViewBase2.addView(viewHolder.messageLinearLayout);
                    Picasso.with(SimpleVideoStream.this)
						.load(siteUrl+"/mod/vedificvc/pix/chat_arrow_2.png")
						.into(viewHolder.imageViewArrow);
					//viewHolder.messageLinearLayout.setBackgroundColor(colorChat2);
					viewHolder.messageLinearLayout.setBackground(getDrawableWithRadius(colorChat2, 20));
					linearLayoutChatViewBase2.addView(viewHolder.imageViewArrow);
					linearLayoutChatViewBase2.addView(viewHolder.imageViewMessage);
					convertView = linearLayoutChatViewBase2;
				} else {
					LinearLayout linearLayoutChatViewBase1 = new LinearLayout(SimpleVideoStream.this);
					LinearLayout.LayoutParams layoutParamsChatViewBase1 = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER_VERTICAL);
					layoutParamsChatViewBase1.setMargins(0, 10, 0, 10);
					linearLayoutChatViewBase1.setPadding(0, 5, 0, 5);
					linearLayoutChatViewBase1.setLayoutParams(layoutParamsChatViewBase1);
					linearLayoutChatViewBase1.setOrientation(LinearLayout.HORIZONTAL);
					linearLayoutChatViewBase1.addView(viewHolder.imageViewMessage);
                    Picasso.with(SimpleVideoStream.this)
						.load(siteUrl+"/mod/vedificvc/pix/chat_arrow_1.png")
						.into(viewHolder.imageViewArrow);
                	viewHolder.messageLinearLayout.setBackground(getDrawableWithRadius(colorChat1, 20));
					linearLayoutChatViewBase1.addView(viewHolder.imageViewArrow);
					linearLayoutChatViewBase1.addView(viewHolder.messageLinearLayout);
					convertView = linearLayoutChatViewBase1;
				}

				convertView.setTag(viewHolder);
				viewHolder.textViewMessage.setText(dataModel.getMessage());
				viewHolder.textViewName.setText(dataModel.getName());
				if(dataModel.getUser_id().equalsIgnoreCase(user_id)) {
					if(dataModel.getSendReceived()!=null) {
						viewHolder.textViewTime.setText(dataModel.getTime() + " | " + dataModel.getSendReceived());
					}else{
						viewHolder.textViewTime.setText(dataModel.getTime());
					}
				}else{
					viewHolder.textViewTime.setText(dataModel.getTime());
				}

				try {
					Picasso.with(SimpleVideoStream.this)
						.load(dataModel.getImageID())
						.transform(new CircleTransform())
                        .resize(iconWidth, iconHeight)
						.into(viewHolder.imageViewMessage);

				} catch (Exception e) {
					e.printStackTrace();
				}
				//Return the completed view to render on screen
				return convertView;
			}
		}


		public class MessageData {
			String message = "";
			String name = "";
			String time = "";
			String imageUrl = "";
			String user_id = "";
			String sendReceived="0";

			public String getImageID() {
				if(imageUrl.trim().length()<=0||imageUrl.contains("image.php")){
					imageUrl=imageUrlDefault;
				} else if(!imageUrl.contains("image.php")&&!imageUrl.contains("&token=")&&!imageUrl.contains("mod/vedificvc/pix")) {
					imageUrl = imageUrl + "&token=" + wsToken;
				}
				
				showMessage(user_name +" : "+imageUrl);
				return imageUrl;
			}

			public void setImageID(String imageID) {
				this.imageUrl = imageID;
			}

			public MessageData(String userId, String name, String message, String imageID, String time,String sendReceived) {
				this.message = message;
				this.imageUrl = imageID;
				this.name = name;
				this.user_id = userId;
				this.time = time;
				this.sendReceived=sendReceived;
			}

			public void setSendReceived(String sendReceived){
				this.sendReceived=sendReceived;
			}

			public String getSendReceived() {
				return sendReceived;
			}

			public String getName() {
				return name;
			}

			public String getTime() {
				return time;
			}

			public String getMessage() {
				return message;
			}


			public String getUser_id() {
				return user_id;
			}

			public void setUser_id(String user_id) {
				this.user_id = user_id;
			}

			public void setMessage(String message) {
				this.message = message;
			}
		}

		public class UserData {
			String user_id = "";
			String user_name = "";
			String user_image = "";

			public UserData(String id, String name, String user_image) {
				this.user_id = id;
				this.user_image = user_image;
				this.user_name = name;
			}

			public String getUser_id() {
				return user_id;
			}

			public String getUser_name() {
				return user_name;
			}

			public String getUser_image() {
				if(user_image.trim().length()<=0||user_image.contains("image.php")){
					user_image=imageUrlDefault;
				}else if(!user_image.contains("image.php")&&!user_image.contains("&token=")&&!user_image.contains("mod/vedificvc/pix")) {
					user_image = user_image + "&token=" + wsToken;
				}
				showMessage(user_name +" : "+user_image);
				return user_image;
			}
		}

		JSONObject jsonObject = null;
		public void getMessagesRequest(String url) {
			try {
				showMessage("url ="+url);

				StringRequest stringRequest = new StringRequest(Request.Method.POST, url, new Response.Listener < String > () {
						@Override
						public void onResponse(String response) {
							try {
								showMessage(response);
								jsonObject = new JSONObject(response);
								try {
									if (jsonObject != null) {
										if (jsonObject.has("status") && jsonObject.getString("status").equalsIgnoreCase("200")) {
											if (jsonObject.has("data")) {
												JSONArray jsonArray = jsonObject.getJSONArray("data");
												for (int i = 0; i < jsonArray.length(); i++) {
													JSONObject jsonObjectMessage = (JSONObject) jsonArray.get(i);
													if (jsonObjectMessage.has("user")) {
														dynamicImageUrl = jsonObjectMessage.getJSONObject("user").getString("mobile_image_url");
														arrayListMessages.add(new SimpleVideoStream.MessageData(jsonObjectMessage.getString("user_id"), jsonObjectMessage.getJSONObject("user").getString("name"), jsonObjectMessage.getString("message"), dynamicImageUrl, jsonObjectMessage.getString("created_time"), null));
														showMessage(dynamicImageUrl);
													} else {
														showMessage("User not found!");
													}
												}

												if (arrayListMessages.size() > 0) {
													messageItemsAdapter.notifyDataSetChanged();
													listView.setSelection(listView.getAdapter().getCount()-1);
													if (!isChatWindowOn) {
														messageCount = arrayListMessages.size();
														textViewChatCount.setText(""+messageCount);
														textViewChatCount.setVisibility(View.VISIBLE);
													}
												} else {
													showMessage("Messages not found!");
													textViewChatCount.setVisibility(View.GONE);
												}

											} else {
												showMessage("Message array not found!");
											}
										}
									} else {
										showMessage("No data found for chat!");
									}
								} catch (Exception e) {
									showMessage("Message Json Exceptions!");
									e.printStackTrace();
								}
							} catch (Exception e) {
								e.printStackTrace();
							}
						}
					},
					new Response.ErrorListener() {
						@Override
						public void onErrorResponse(VolleyError error) {
							if (error instanceof TimeoutError || error instanceof NoConnectionError) {
								showMessage("NoConnectionError : " + error.getMessage());
							} else if (error instanceof AuthFailureError) {
								showMessage("AuthFailureError : " + error.getMessage());
							} else if (error instanceof ServerError) {
								showMessage("ServerError : " + error.getMessage());
							} else if (error instanceof NetworkError) {
								showMessage("NetworkError : " + error.getMessage());
							} else if (error instanceof ParseError) {
								error.printStackTrace();
								showMessage("ParseError : " + error.getMessage());
							}
						}
					}) {

					@Override
					protected Map < String, String > getParams() {
						Map < String, String > params = new HashMap();
						params.put("moodlewsrestformat", "json");
						params.put("wsfunction", "mod_vedificvc_chat_history");
						params.put("page", "0");
						params.put("room_id", room_id);
						params.put("wstoken", wsToken);
						params.put("user_name", user_name);
						params.put("user_id", user_id);
						params.put("image_url", user_image_url);
						showMessage("history api: " + params.toString());
						return params;
					}
				};
				addToRequestQueue(stringRequest, "headerRequest");
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		public void postMessagesToServer(String url, final String message, final String userId) {
			try {
				StringRequest stringRequest = new StringRequest(Request.Method.POST, url, new Response.Listener < String > () {
						@Override
						public void onResponse(String response) {
							try {
								showMessage("postMessagesToServer : "+response);
								jsonObject = new JSONObject(response);
								try {
									if (jsonObject != null) {
										if (jsonObject.has("status") && jsonObject.getString("status").equalsIgnoreCase("200")) {
											showMessage("postMessagesToServer Response : 200, message data saved to server");
										} else {
											showMessage("postMessagesToServer Response : " + jsonObject.getString("status") + " message data to server");
										}
									}
								} catch (Exception e) {
									showMessage("postMessagesToServer Json Exceptions!");
									e.printStackTrace();
								}
							} catch (Exception e) {
								e.printStackTrace();
							}
						}
					},
					new Response.ErrorListener() {
						@Override
						public void onErrorResponse(VolleyError error) {
							if (error instanceof TimeoutError || error instanceof NoConnectionError) {
								showMessage("NoConnectionError : " + error.getMessage());
							} else if (error instanceof AuthFailureError) {
								showMessage("AuthFailureError : " + error.getMessage());
							} else if (error instanceof ServerError) {
								showMessage("ServerError : " + error.getMessage());
							} else if (error instanceof NetworkError) {
								showMessage("NetworkError : " + error.getMessage());
							} else if (error instanceof ParseError) {
								error.printStackTrace();
								showMessage("postMessagesToServer ParseError : " + error.getMessage());
							}
						}
					}) {

					@Override
					protected Map < String, String > getParams() {
						Map < String, String > params = new HashMap();
						params.put("moodlewsrestformat", "json");
						params.put("wsfunction", "mod_vedificvc_save_chat_history");
						params.put("sending_to", "0");
						params.put("user_id", userId);
						params.put("room_id", room_id);
						params.put("is_read", "0");
						params.put("message", message);
						params.put("wstoken", wsToken);
						showMessage(params.toString());
						return params;
					}
				};
				addToRequestQueue(stringRequest, "headerRequest");
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		public void checkUserStatus(String url) {
			try {
				showMessage("checkUserStatus Url : " + url);
				StringRequest jsonStringReq = new StringRequest(Request.Method.GET, url, new Response.Listener < String > () {
						@Override
						public void onResponse(String response) {
							try {
								if (response != null) {
									JSONObject responseJsonObject = new JSONObject(response);
									String message = "no message 1";
									if (responseJsonObject.has("message")) {
										try {
											message = responseJsonObject.getString("message");
											if (message.equalsIgnoreCase("Unauthenticated.")) {
												message = "checkUserStatus Unauthenticated.";
											}
										} catch (JSONException e) {
											e.printStackTrace();
										}
										if (message == null || message.length() <= 0) {
											message = "checkUserStatus no message 2";
										}
										showMessage(message);
									} else {
										showMessage(message);
									}
								} else {
									showMessage("checkUserStatus Response is null");
								}
							} catch (Exception e) {
								e.printStackTrace();
							}
						}
					},
					new Response.ErrorListener() {
						@Override
						public void onErrorResponse(VolleyError error) {
							if (error instanceof TimeoutError || error instanceof NoConnectionError) {
								showMessage("checkUserStatus NoConnectionError : " + error.getMessage());
							} else if (error instanceof AuthFailureError) {
								showMessage("checkUserStatus AuthFailureError : " + error.getMessage());
							} else if (error instanceof ServerError) {
								showMessage("checkUserStatus ServerError : " + error.getMessage());
							} else if (error instanceof NetworkError) {
								showMessage("checkUserStatus NetworkError : " + error.getMessage());
							} else if (error instanceof ParseError) {
								showMessage("checkUserStatus ParseError : " + error.getMessage());
								wrapItUp(0, "OK");
							}
						}
					}) {
					@Override
					public Map getHeaders() throws AuthFailureError {
						HashMap headers = new HashMap();
						headers.put("Content-Type", "application/json");
						headers.put("Authorization", "Bearer " + authorizationString);
						return headers;
					}
				};
				addToRequestQueue(jsonStringReq, "headerRequest");
			} catch (Exception e) {
				e.printStackTrace();
			}
		}


		public RequestQueue getRequestQueue() {
			if (requestQueue == null)
				requestQueue = Volley.newRequestQueue(getApplicationContext());
			return requestQueue;
		}

		public void addToRequestQueue(Request request, String tag) {
			request.setTag(tag);
			getRequestQueue().add(request);
		}

		public void cancelAllRequests(String tag) {
			getRequestQueue().cancelAll(tag);
		}

		public class CircleTransform implements Transformation {
			@Override
			public Bitmap transform(Bitmap source) {
				int size = Math.min(source.getWidth(), source.getHeight());

				int x = (source.getWidth() - size) / 2;
				int y = (source.getHeight() - size) / 2;

				Bitmap squaredBitmap = Bitmap.createBitmap(source, x, y, size, size);
				if (squaredBitmap != source) {
					source.recycle();
				}

				Bitmap bitmap = Bitmap.createBitmap(size, size, source.getConfig());

				Canvas canvas = new Canvas(bitmap);
				Paint paint = new Paint();
				BitmapShader shader = new BitmapShader(squaredBitmap, BitmapShader.TileMode.CLAMP, BitmapShader.TileMode.CLAMP);
				paint.setShader(shader);
				paint.setAntiAlias(true);

				float r = size /2;
				canvas.drawCircle(r, r, r, paint);

				squaredBitmap.recycle();
				return bitmap;
			}

			@Override
			public String key() {
				return "circle";
			}
		}


	}