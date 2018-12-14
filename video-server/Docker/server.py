import sys
import subprocess
import socket

if len(sys.argv)<3:
	print("Usage: python server.py port")
else:
	s=socket.socket()
	host=socket.gethostname()
	port=int(sys.argv[1])
	s.bind((host, port))
	s.listen(5)
	while True:
		c, addr=s.accept()
		data=c.recv(1024)
		c.close()
		vidName=data[0]	# Change to wherever video name is stored
		imgName=data[1]	# Change to wherever image name is stored
		# Read and write from S3 bucket, these use awscli, there's probably a better way
		#subprocess.call(["aws", "s3", "cp", "s3://the-gift-files/videos/"+vidName, "./video.mp4"])
		#subprocess.call(["aws", "s3", "cp", "s3://the-gift-files/images/"+imgName, "./image.jpg"])
		subprocess.call(["Process", "video.mp4", "motion-tracking.json", "image.jpg", "output.mp4"])
		#subprocess.call(["aws", "s3", "cp", "./output.mp4", "s3://the-gift-files/videos/"+imgName[0:len(imgName)-4]])
		subprocess.call(["rm", "video.mp4"])
		subprocess.call(["rm", "image.jpg"])
		subprocess.call(["rm", "output.mp4"])
