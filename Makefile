git :
	@git add .
	@git commit -m "Commit"
	@git push origin master
clean:
	find . -name "*~" -type f -delete

