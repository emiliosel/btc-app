import Container from "@mui/material/Container";
import { GetAddressInfo } from "../components/GetAddressInfo";
import { GetTransactionInfo } from "../components/GetTransactionInfo";
import NotificationsList from "../components/Notifications";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { Divider } from "@mui/material";

export default function Web() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BTC info
          </Typography>
          <Button color="inherit" href="/test" LinkComponent={Link}>
            Test page
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" style={{ marginTop: 20 }}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                  Search for BTC Transaction or Address info
                </Typography>
                {/* <Link href="/test" color="secondary">
                  Go to the test page
                </Link> */}

                <GetAddressInfo></GetAddressInfo>
                <Divider style={{margin: '20px 0'}}/>
                <GetTransactionInfo></GetTransactionInfo>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent>
                <NotificationsList></NotificationsList>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
