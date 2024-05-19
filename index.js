const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');

// Neo4j sürücüsünü yapılandırın
const driver = neo4j.driver('bolt://3.93.231.126:7687',
                  neo4j.auth.basic('neo4j', 'advancements-swimmers-inlet'),
                  { /* encrypted: 'ENCRYPTION_OFF' */ });

const app = express();
app.use(bodyParser.json());

// Film ekleme
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

// Film bilgisi alma
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

// Film silme
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

// Tüm filmleri getirme
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


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
