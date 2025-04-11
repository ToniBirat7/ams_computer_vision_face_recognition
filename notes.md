Now we're moving to very crucial part of our project i.e. Attendance using Face Recognition. We've already trained our model. Insider Face_Rec folder contains our embedding and test.py contains the code that takes the video frame and predicts the label for current frame. 

Now, in the student_list.html we need to provide a button which says start video attendance. The overall design and components of the student_list.html remains the same, we're just adding another component i.e. start video attendance button. Once the user clicks the button in the same page (student_list.html) a component that shows the current prediction frame from our model  is shown. 

For this we will establish a web socket connection when the user clicks start video attendance and send then a connection will be established which will turn on the camera take the feed pass though our model and each processed frame should be displayed in the component as well. 

For each predicted label, the present should ticked automatically as in the previous implementation of the student_list.html. Also, there should be another button appear after displaying the video frame component i.e. close attendance. Once the user clicks this button the video frame should disappear from the UI and then rest of the students who are not detected or labled from the prediction are to be ticked as absent in the UI. Then finally user clicks save attendance then only we will submit the data and save in the database. 

1. UI Modifications (student_list.html):
   - Add "Start Video Attendance" button
   - Create video feed component (initially hidden)
   - Add "Close Attendance" button (initially hidden)
   - Maintain existing attendance marking UI

2. WebSocket Implementation:
   a. Server Side:
      - Create WebSocket consumer for video stream
      - Handle frame processing using face recognition model
      - Send prediction results back to client
      - Manage connection lifecycle

   b. Client Side:
      - Establish WebSocket connection on button click
      - Handle video stream capture
      - Send frames to server
      - Receive and display processed frames
      - Update attendance UI based on predictions

3. Face Recognition Integration:
   - Load pre-trained model and embeddings
   - Process video frames
   - Match faces with student database
   - Return predictions with confidence scores

4. Attendance Marking Flow:
   Step 1: Initial State
   - Show regular attendance UI
   - Display "Start Video Attendance" button
   
   Step 2: Video Attendance Mode
   - User clicks "Start Video Attendance"
   - Open WebSocket connection
   - Show video component
   - Display "Close Attendance" button
   - Auto-mark students as present when detected
   
   Step 3: Closing Video Attendance
   - User clicks "Close Attendance"
   - Close WebSocket connection
   - Hide video component
   - Mark undetected students as absent
   - Return to normal attendance UI
   
   Step 4: Saving Attendance
   - User reviews final attendance
   - Clicks "Save Attendance"
   - Submit to database

5. Technical Components Needed:
   a. New Files:
      - consumers.py (WebSocket handler)
      - routing.py (WebSocket URL configuration)
      - video_processor.py (Face recognition integration)
      - websocket.js (Client-side WebSocket handling)

   b. Modifications:
      - student_list.html (UI updates)
      - attendance.css (New component styles)
      - attendance.js (WebSocket and UI interactions)
      - views.py (Additional endpoints if needed)

6. Error Handling:
   - WebSocket connection failures
   - Camera access issues
   - Face recognition errors
   - Database update failures

7. Performance Considerations:
   - Frame processing optimization
   - WebSocket message size
   - Browser memory management
   - Server resource usage

