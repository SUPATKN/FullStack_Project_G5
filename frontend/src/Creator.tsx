import { Container } from "react-bootstrap";
import Layout from "./Layout";
import "./global.css";
import p1 from "./811.jpg";
import p2 from "./812.jpg";
import p3 from "./813.jpg";

const Creator = () => {
  return (
    <Layout>
      <Container
        fluid
        className="team section d-flex justify-content-center align-items-start"
      >
        <div className="container text-center">
          <link
            href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
            rel="stylesheet"
          />
          <div className="row justify-content-center">
            <div className="col-12 col-sm-8 col-lg-6">
              {/* Section Heading */}
              <div
                className="section_heading wow fadeInUp"
                data-wow-delay="0.2s"
                style={{
                  visibility: "visible",
                  animationDelay: "0.2s",
                  animationName: "fadeInUp",
                }}
              >
                <h3>
                  Our Developer <span>Team</span>
                </h3>
                <p>
                  A web page is an online document that combines text, images,
                  and interactive features to convey information or provide
                  functionality, accessible through a web browser.
                </p>
                <div className="line" />
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            {/* Single Advisor */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div
                className="single_advisor_profile wow fadeInUp"
                data-wow-delay="0.2s"
                style={{
                  visibility: "visible",
                  animationDelay: "0.2s",
                  animationName: "fadeInUp",
                }}
              >
                {/* Team Thumb */}
                <div className="advisor_thumb">
                  <img src={p1} alt="Samantha Sarah" />
                  {/* Social Info */}
                  <div className="social-info">
                    <a href="https://www.facebook.com/Titanz7x/">
                      <i className="fa fa-facebook" />
                    </a>
                    <a href="https://www.instagram.com/tit4nzx_/">
                      <i className="fa fa-instagram" />
                    </a>
                  </div>
                </div>
                {/* Team Details */}
                <div className="single_advisor_details_info">
                  <h6>650610811</h6>
                  <h6>Suphakorn komod</h6>
                  <p className="designation">Front-End Developer</p>
                  <hr></hr>
                  <p className="designation">
                    " Discipline will set you free without discipline , You will
                    be a slave to your passion and passion "
                  </p>
                </div>
              </div>
            </div>
            {/* Single Advisor */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div
                className="single_advisor_profile wow fadeInUp"
                data-wow-delay="0.3s"
                style={{
                  visibility: "visible",
                  animationDelay: "0.3s",
                  animationName: "fadeInUp",
                }}
              >
                {/* Team Thumb */}
                <div className="advisor_thumb">
                  <img src={p2} alt="Nazrul Islam" />
                  {/* Social Info */}
                  <div className="social-info">
                    <a href="https://www.facebook.com/supatkn">
                      <i className="fa fa-facebook" />
                    </a>
                    <a href="https://www.instagram.com/supatkn/">
                      <i className="fa fa-instagram" />
                    </a>
                  </div>
                </div>
                {/* Team Details */}
                <div className="single_advisor_details_info">
                  <h6>650610812</h6>
                  <h6>Supatkorn Pundontong</h6>
                  <p className="designation">Back-End Developer</p>
                  <hr></hr>
                  <p className="designation">
                    " The sun is gone , But I have a light "
                  </p>
                </div>
              </div>
            </div>
            {/* Single Advisor */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div
                className="single_advisor_profile wow fadeInUp"
                data-wow-delay="0.4s"
                style={{
                  visibility: "visible",
                  animationDelay: "0.4s",
                  animationName: "fadeInUp",
                }}
              >
                {/* Team Thumb */}
                <div className="advisor_thumb">
                  <img src={p3} alt="Riyadh Khan" />
                  {/* Social Info */}
                  <div className="social-info">
                    <a href="https://www.facebook.com/profile.php?id=100069294507230">
                      <i className="fa fa-facebook" />
                    </a>
                    <a href="https://www.instagram.com/tt_kmsw/">
                      <i className="fa fa-instagram" />
                    </a>
                  </div>
                </div>
                {/* Team Details */}
                <div className="single_advisor_details_info">
                  <h6>650610813</h6>
                  <h6>Sippakon Khammisawang</h6>
                  <p className="designation">Back-End Developer</p>
                  <hr></hr>
                  <p className="designation">
                    " Old keys won’t Open new doors "
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default Creator;
