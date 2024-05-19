const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');


const driver = neo4j.driver('bolt://3.93.231.126:7687',
                  neo4j.auth.basic('neo4j', 'advancements-swimmers-inlet'),
                  { /* encrypted: 'ENCRYPTION_OFF' */ });

const app = express();
app.use(bodyParser.json());


app.post('/addMovie', async (req, res) => {
  const { title, released, tagline } = req.body;
  const session = driver.session({ database: "neo4j" });
  try {
    const result = await session.run(
      'CREATE (m:Movie {title: $title, released: $released, tagline: $tagline}) RETURN m',
      { title, released, tagline }
    );
    res.status(200).json(result.records[0].get(0));
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await session.close();
  }
});

app.get('/getMovie/:title', async (req, res) => {
  const { title } = req.params;
  const session = driver.session({ database: "neo4j" });
  try {
    const result = await session.run(
      'MATCH (m:Movie {title: $title}) RETURN m',
      { title }
    );
    if (result.records.length === 0) {
      res.status(404).send("Movie not found");
    } else {
      res.status(200).json(result.records[0].get(0));
    }
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await session.close();
  }
});


app.delete('/deleteMovie/:title', async (req, res) => {
  const { title } = req.params;
  const session = driver.session({ database: "neo4j" });
  try {
    await session.run(
      'MATCH (m:Movie {title: $title}) DETACH DELETE m',
      { title }
    );
    res.status(200).send("Movie deleted");
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await session.close();
  }
});


app.get('/getAllMovies', async (req, res) => {
    const session = driver.session({ database: "neo4j" });
    try {
      const result = await session.run(
        'MATCH (m:Movie) RETURN m'
      );
      const movies = result.records.map(record => record.get('m').properties);
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).send(error);
    } finally {
      await session.close();
    }
  });


app.post('/addActor', async (req, res) => {
  const { name, born } = req.body;
  const session = driver.session({ database: "neo4j" });
  try {
    const result = await session.run(
      'CREATE (a:Actor {name: $name, born: $born}) RETURN a',
      { name, born }
    );
    res.status(200).json(result.records[0].get(0));
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await session.close();
  }
});


app.post('/addActorToMovie', async (req, res) => {
  const { actorName, movieTitle } = req.body;
  const session = driver.session({ database: "neo4j" });
  try {
    await session.run(
      'MATCH (a:Actor {name: $actorName}), (m:Movie {title: $movieTitle}) ' +
      'CREATE (a)-[:ACTED_IN]->(m)',
      { actorName, movieTitle }
    );
    res.status(200).send("Actor added to movie");
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await session.close();
  }
});

app.get('/getActorsInMovie/:title', async (req, res) => {
  const { title } = req.params;
  const session = driver.session({ database: "neo4j" });
  try {
    const result = await session.run(
      'MATCH (a:Actor)-[:ACTED_IN]->(m:Movie {title: $title}) RETURN a',
      { title }
    );
    if (result.records.length === 0) {
      res.status(404).send("No actors found for the specified movie");
    } else {
      const actors = result.records.map(record => record.get('a').properties);
      res.status(200).json(actors);
    }
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await session.close();
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
