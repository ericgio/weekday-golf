# 🏌🏾‍♂ Weekday Golf
NextJS webapp for tracking and displaying the results of our golf games.

## Contributing
Contributions from Weekday Golf participants are welcome. You should already have access to evrything you need.

### Installation
Clone the repo locally and install dependencies:
```sh
$ git clone git@github.com:ericgio/weekday-golf.git
$ cd weekday-golf
$ yarn install
```
### Environment Variables
The app requires a couple env variables, which you can get from Eric G. or from the Heroku app.
```sh
$ cp .env.example .env
```
Add the env vars to the `.env` file.

### Run the App
```sh
$ yarn dev
```
This script will build the static data, bundle the app, and start a local server. The location defaults to `localhost:3000` but you can change this by changing the `$PORT` variable to something else.

### Data
Data from all the rounds are stored in a Google spreadsheet that everyone should be able to edit.

To add new data:
1. Create a new tab within the spreadsheet (or make a copy from an existing one).
2. Name the tab so it corresponds to the ISO date of the round (YYYY-MM-DDThh:mm:ss)
3. Add the round data in the proper format. The first 2 rows will be ignored, and the first column will be assumed to contain the participant's name.

The app doesn't pull data from the spreadsheet on each page load. Instead, there is a build step that parses the spreadsheet, transforms the data, and generates 2 static JSON files to be used by the app for displaying the data. You can run this manually with `yarn run data`. On Heroku, the step will run automatically whenever the app is redeployed.

### Deployment
The Heroku app is connected to the Github repo and should automatically redeploy whenever a commit is pushed to `master`. If you just want to update the data, (eg: after adding a new round to the spreadhseet), redeploy the app manually by going to the "Deploy" tab in Heroku, scrolling to the bottom, and clicking the "Deploy Branch" button.

## To Do:

### Stats
- [X] highlight lowest score per hole
- [X] rounds played by player
- [X] Top rounds
- [X] average round by player
- [X] best/worst hole (overall, by player)
- [ ] score distribution by player
- [ ] skins won

### App
- [ ] data entry
- [ ] calculate skins + payouts
